'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

type Album = {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  event_date: string | null;
  is_public: boolean;
  created_at: string;
  photo_count?: number;
};

type Photo = {
  id: string;
  album_id: string;
  image_url: string;
  thumbnail_url: string | null;
  caption: string | null;
  taken_at: string | null;
  created_at: string;
};

/**
 * チームポータル - アルバムページ
 */
export default function AlbumPage() {
  const params = useParams();
  const teamId = params.teamId as string;

  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [isManager, setIsManager] = useState(false);
  const [showAlbumForm, setShowAlbumForm] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [showPhotoForm, setShowPhotoForm] = useState(false);

  // アルバムフォーム
  const [albumForm, setAlbumForm] = useState({
    title: '',
    description: '',
    event_date: '',
  });

  // 写真フォーム
  const [photoForm, setPhotoForm] = useState({
    image_url: '',
    caption: '',
  });

  useEffect(() => {
    loadData();
  }, [teamId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // 権限確認
      const { data: managerCheck } = await supabase.rpc('is_team_manager_of', {
        team_uuid: teamId
      });
      setIsManager(!!managerCheck);

      // アルバム一覧取得
      const { data: albumsData, error } = await supabase
        .from('team_albums')
        .select('*')
        .eq('team_id', teamId)
        .order('event_date', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      // 各アルバムの写真数を取得
      const albumsWithCount = await Promise.all(
        (albumsData || []).map(async (album: Album) => {
          const { count } = await supabase
            .from('team_album_photos')
            .select('*', { count: 'exact', head: true })
            .eq('album_id', album.id);
          return { ...album, photo_count: count || 0 };
        })
      );

      setAlbums(albumsWithCount);
    } catch (err) {
      console.error('アルバムの取得に失敗:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPhotos = async (albumId: string) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('team_album_photos')
        .select('*')
        .eq('album_id', albumId)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (err) {
      console.error('写真の取得に失敗:', err);
    }
  };

  const handleSelectAlbum = async (album: Album) => {
    setSelectedAlbum(album);
    await loadPhotos(album.id);
  };

  const resetAlbumForm = () => {
    setAlbumForm({ title: '', description: '', event_date: '' });
    setEditingAlbum(null);
  };

  const openEditAlbumForm = (album: Album) => {
    setAlbumForm({
      title: album.title,
      description: album.description || '',
      event_date: album.event_date || '',
    });
    setEditingAlbum(album);
    setShowAlbumForm(true);
  };

  const handleSubmitAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const albumData = {
        team_id: teamId,
        title: albumForm.title,
        description: albumForm.description || null,
        event_date: albumForm.event_date || null,
        created_by: user?.id,
      };

      if (editingAlbum) {
        const { error } = await supabase
          .from('team_albums')
          .update(albumData)
          .eq('id', editingAlbum.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('team_albums')
          .insert(albumData);
        if (error) throw error;
      }

      setShowAlbumForm(false);
      resetAlbumForm();
      loadData();
    } catch (err: any) {
      alert('アルバムの保存に失敗しました: ' + err.message);
    }
  };

  const handleDeleteAlbum = async (albumId: string) => {
    if (!confirm('このアルバムを削除しますか？写真もすべて削除されます。')) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('team_albums')
        .delete()
        .eq('id', albumId);

      if (error) throw error;
      setSelectedAlbum(null);
      loadData();
    } catch (err: any) {
      alert('削除に失敗しました: ' + err.message);
    }
  };

  const handleSubmitPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlbum) return;

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('team_album_photos')
        .insert({
          album_id: selectedAlbum.id,
          image_url: photoForm.image_url,
          caption: photoForm.caption || null,
          uploaded_by: user?.id,
        });

      if (error) throw error;

      setPhotoForm({ image_url: '', caption: '' });
      setShowPhotoForm(false);
      loadPhotos(selectedAlbum.id);
      loadData();
    } catch (err: any) {
      alert('写真の追加に失敗しました: ' + err.message);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('この写真を削除しますか？')) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('team_album_photos')
        .delete()
        .eq('id', photoId);

      if (error) throw error;
      setSelectedPhoto(null);
      if (selectedAlbum) {
        loadPhotos(selectedAlbum.id);
        loadData();
      }
    } catch (err: any) {
      alert('削除に失敗しました: ' + err.message);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
      </div>
    );
  }

  // アルバム詳細表示
  if (selectedAlbum) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => { setSelectedAlbum(null); setPhotos([]); }}
            className="text-gray-600 hover:text-gray-800"
          >
            ← 戻る
          </button>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{selectedAlbum.title}</h2>
            {selectedAlbum.event_date && (
              <p className="text-sm text-gray-500">{formatDate(selectedAlbum.event_date)}</p>
            )}
          </div>
          {isManager && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowPhotoForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                写真を追加
              </button>
              <button
                onClick={() => openEditAlbumForm(selectedAlbum)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
              >
                編集
              </button>
            </div>
          )}
        </div>

        {selectedAlbum.description && (
          <p className="text-gray-600">{selectedAlbum.description}</p>
        )}

        {photos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500">写真がありません</p>
            {isManager && (
              <button
                onClick={() => setShowPhotoForm(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                最初の写真を追加
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity relative"
              >
                <Image
                  src={photo.thumbnail_url || photo.image_url}
                  alt={photo.caption || 'Photo'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </div>
            ))}
          </div>
        )}

        {/* 写真追加フォーム */}
        {showPhotoForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">写真を追加</h3>
                <button onClick={() => setShowPhotoForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <form onSubmit={handleSubmitPhoto} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">画像URL *</label>
                  <input
                    type="url"
                    value={photoForm.image_url}
                    onChange={(e) => setPhotoForm({ ...photoForm, image_url: e.target.value })}
                    required
                    placeholder="https://..."
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    ※ 外部画像URLを入力してください
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">キャプション</label>
                  <input
                    type="text"
                    value={photoForm.caption}
                    onChange={(e) => setPhotoForm({ ...photoForm, caption: e.target.value })}
                    placeholder="写真の説明"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  追加
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 写真ビューア */}
        {selectedPhoto && (
          <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
            <div className="flex justify-between items-center p-4">
              <button
                onClick={() => setSelectedPhoto(null)}
                className="text-white hover:text-gray-300"
              >
                ✕ 閉じる
              </button>
              {isManager && (
                <button
                  onClick={() => handleDeletePhoto(selectedPhoto.id)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  削除
                </button>
              )}
            </div>
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="relative max-w-full max-h-full">
                <Image
                  src={selectedPhoto.image_url}
                  alt={selectedPhoto.caption || 'Photo'}
                  width={1200}
                  height={800}
                  className="object-contain max-h-[80vh]"
                />
              </div>
            </div>
            {selectedPhoto.caption && (
              <div className="p-4 text-center text-white">
                {selectedPhoto.caption}
              </div>
            )}
          </div>
        )}

        {/* アルバム編集フォーム */}
        {showAlbumForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">アルバムを編集</h3>
                <button onClick={() => { setShowAlbumForm(false); resetAlbumForm(); }} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <form onSubmit={handleSubmitAlbum} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">タイトル *</label>
                  <input
                    type="text"
                    value={albumForm.title}
                    onChange={(e) => setAlbumForm({ ...albumForm, title: e.target.value })}
                    required
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">日付</label>
                  <input
                    type="date"
                    value={albumForm.event_date}
                    onChange={(e) => setAlbumForm({ ...albumForm, event_date: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
                  <textarea
                    value={albumForm.description}
                    onChange={(e) => setAlbumForm({ ...albumForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    保存
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteAlbum(selectedAlbum.id)}
                    className="px-4 py-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                  >
                    削除
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // アルバム一覧
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">アルバム</h2>
        {isManager && (
          <button
            onClick={() => { resetAlbumForm(); setShowAlbumForm(true); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            アルバムを作成
          </button>
        )}
      </div>

      {albums.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="text-6xl mb-4">📷</div>
          <p className="text-gray-500">アルバムがありません</p>
          {isManager && (
            <button
              onClick={() => { resetAlbumForm(); setShowAlbumForm(true); }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              最初のアルバムを作成
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album) => (
            <div
              key={album.id}
              onClick={() => handleSelectAlbum(album)}
              className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="aspect-video bg-gray-100 relative">
                {album.cover_image_url ? (
                  <Image
                    src={album.cover_image_url}
                    alt={album.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <span className="text-5xl">📷</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">{album.title}</h3>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                  {album.event_date && <span>{formatDate(album.event_date)}</span>}
                  <span>{album.photo_count || 0}枚</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* アルバム作成フォーム */}
      {showAlbumForm && !selectedAlbum && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{editingAlbum ? 'アルバムを編集' : 'アルバムを作成'}</h3>
              <button onClick={() => { setShowAlbumForm(false); resetAlbumForm(); }} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleSubmitAlbum} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">タイトル *</label>
                <input
                  type="text"
                  value={albumForm.title}
                  onChange={(e) => setAlbumForm({ ...albumForm, title: e.target.value })}
                  required
                  placeholder="練習試合 vs ◯◯FC"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">日付</label>
                <input
                  type="date"
                  value={albumForm.event_date}
                  onChange={(e) => setAlbumForm({ ...albumForm, event_date: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
                <textarea
                  value={albumForm.description}
                  onChange={(e) => setAlbumForm({ ...albumForm, description: e.target.value })}
                  rows={3}
                  placeholder="アルバムの説明..."
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingAlbum ? '保存' : '作成'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
