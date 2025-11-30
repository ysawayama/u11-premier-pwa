'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Plus, Edit2, Trash2, Eye, EyeOff, Upload, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { getAllAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '@/lib/api/announcements';
import type { Announcement } from '@/types/database';

export default function AnnouncementsAdminPage() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isWebmaster, setIsWebmaster] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // フォームstate
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    published_at: new Date().toISOString().split('T')[0],
    image_url: '',
    is_published: true,
  });

  // 画像アップロード用
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    checkAccessAndLoad();
  }, []);

  const checkAccessAndLoad = async () => {
    const supabase = createClient();
    const { data: isWm } = await supabase.rpc('is_webmaster');

    if (!isWm) {
      router.push('/dashboard');
      return;
    }

    setIsWebmaster(true);
    await loadAnnouncements();
  };

  const loadAnnouncements = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      const { data, total: totalCount } = await getAllAnnouncements(pageNum, 10);
      setAnnouncements(data);
      setTotal(totalCount);
      setPage(pageNum);
    } catch (err) {
      console.error('Error loading announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const supabase = createClient();

      // ファイル名をユニークにする
      const fileExt = file.name.split('.').pop();
      const fileName = `announcements/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('public')
        .getPublicUrl(fileName);

      setFormData({ ...formData, image_url: publicUrl });
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('画像のアップロードに失敗しました');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      published_at: new Date().toISOString().split('T')[0],
      image_url: '',
      is_published: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (announcement: Announcement) => {
    setFormData({
      title: announcement.title,
      content: announcement.content,
      published_at: announcement.published_at,
      image_url: announcement.image_url || '',
      is_published: announcement.is_published,
    });
    setEditingId(announcement.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('タイトルと内容を入力してください');
      return;
    }

    try {
      setSubmitting(true);

      if (editingId) {
        await updateAnnouncement(editingId, {
          title: formData.title,
          content: formData.content,
          published_at: formData.published_at,
          image_url: formData.image_url || null,
          is_published: formData.is_published,
        });
      } else {
        await createAnnouncement({
          title: formData.title,
          content: formData.content,
          published_at: formData.published_at,
          image_url: formData.image_url || null,
          is_published: formData.is_published,
        });
      }

      resetForm();
      await loadAnnouncements(page);
    } catch (err) {
      console.error('Error saving announcement:', err);
      alert('保存に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('このお知らせを削除しますか？')) return;

    try {
      await deleteAnnouncement(id);
      await loadAnnouncements(page);
    } catch (err) {
      console.error('Error deleting announcement:', err);
      alert('削除に失敗しました');
    }
  };

  const togglePublished = async (announcement: Announcement) => {
    try {
      await updateAnnouncement(announcement.id, {
        is_published: !announcement.is_published,
      });
      await loadAnnouncements(page);
    } catch (err) {
      console.error('Error toggling published:', err);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (!isWebmaster) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalPages = Math.ceil(total / 10);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft size={20} />
              </Link>
              <h1 className="text-lg font-bold">お知らせ管理</h1>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">新規作成</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : (
          <>
            {/* お知らせ一覧 */}
            <div className="space-y-3">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className={`bg-white rounded-lg shadow-sm p-4 ${!announcement.is_published ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold truncate">{announcement.title}</h3>
                        {!announcement.is_published && (
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">非公開</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{formatDate(announcement.published_at)}</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{announcement.content}</p>
                      {announcement.image_url && (
                        <div className="mt-2 w-20 h-14 relative rounded overflow-hidden">
                          <Image
                            src={announcement.image_url}
                            alt=""
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => togglePublished(announcement)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                        title={announcement.is_published ? '非公開にする' : '公開する'}
                      >
                        {announcement.is_published ? <Eye size={18} className="text-green-600" /> : <EyeOff size={18} className="text-gray-400" />}
                      </button>
                      <button
                        onClick={() => handleEdit(announcement)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                        title="編集"
                      >
                        <Edit2 size={18} className="text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(announcement.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                        title="削除"
                      >
                        <Trash2 size={18} className="text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {announcements.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  お知らせがありません
                </div>
              )}
            </div>

            {/* ページネーション */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => loadAnnouncements(p)}
                    className={`w-10 h-10 rounded-lg ${
                      p === page ? 'bg-primary text-white' : 'bg-white hover:bg-gray-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* 作成・編集モーダル */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">
                  {editingId ? 'お知らせを編集' : 'お知らせを作成'}
                </h3>
                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">投稿日 *</label>
                  <input
                    type="date"
                    value={formData.published_at}
                    onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">タイトル *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="お知らせのタイトル"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">内容 *</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                    rows={8}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary resize-none"
                    placeholder="お知らせの内容を入力（URLは自動でリンクになります）"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">画像（任意）</label>
                  {formData.image_url ? (
                    <div className="relative">
                      <div className="w-full h-40 relative rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={formData.image_url}
                          alt="プレビュー"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image_url: '' })}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center gap-2 w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                      <Upload size={20} className="text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {uploading ? 'アップロード中...' : '画像を選択'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_published"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="is_published" className="text-sm text-gray-700">
                    公開する
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 py-3 border rounded-lg hover:bg-gray-50"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50"
                  >
                    {submitting ? '保存中...' : (editingId ? '更新' : '作成')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
