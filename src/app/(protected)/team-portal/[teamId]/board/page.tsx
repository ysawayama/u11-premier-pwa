'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type PostCategory = 'announcement' | 'general' | 'question' | 'event';

type Post = {
  id: string;
  title: string;
  content: string;
  category: PostCategory;
  is_pinned: boolean;
  author_id: string;
  created_at: string;
  updated_at: string;
  comment_count: number;
};

type Comment = {
  id: string;
  post_id: string;
  content: string;
  author_id: string;
  created_at: string;
};

const CATEGORY_CONFIG: Record<PostCategory, { label: string; color: string; bgColor: string }> = {
  announcement: { label: 'お知らせ', color: 'text-red-700', bgColor: 'bg-red-100' },
  general: { label: '一般', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  question: { label: '質問', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  event: { label: 'イベント', color: 'text-green-700', bgColor: 'bg-green-100' },
};

/**
 * チームポータル - 掲示板ページ
 */
export default function BoardPage() {
  const params = useParams();
  const teamId = params.teamId as string;

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isManager, setIsManager] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showPostForm, setShowPostForm] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  // 投稿フォーム
  const [postForm, setPostForm] = useState({
    title: '',
    content: '',
    category: 'general' as PostCategory,
    is_pinned: false,
  });

  useEffect(() => {
    loadData();
  }, [teamId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // ユーザー情報
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);

      // 権限確認
      const { data: managerCheck } = await supabase.rpc('is_team_manager_of', {
        team_uuid: teamId
      });
      setIsManager(!!managerCheck);

      // 投稿一覧取得
      const { data: postsData, error } = await supabase
        .from('team_board_posts')
        .select('*')
        .eq('team_id', teamId)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      // コメント数を取得
      const postsWithComments = await Promise.all(
        (postsData || []).map(async (post: Omit<Post, 'comment_count'>) => {
          const { count } = await supabase
            .from('team_board_comments')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id);
          return { ...post, comment_count: count || 0 };
        })
      );

      setPosts(postsWithComments);
    } catch (err) {
      console.error('投稿の取得に失敗:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async (postId: string) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('team_board_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (err) {
      console.error('コメントの取得に失敗:', err);
    }
  };

  const handleSelectPost = async (post: Post) => {
    setSelectedPost(post);
    await loadComments(post.id);
  };

  const resetPostForm = () => {
    setPostForm({
      title: '',
      content: '',
      category: 'general',
      is_pinned: false,
    });
    setEditingPost(null);
  };

  const openEditForm = (post: Post) => {
    setPostForm({
      title: post.title,
      content: post.content,
      category: post.category,
      is_pinned: post.is_pinned,
    });
    setEditingPost(post);
    setShowPostForm(true);
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const postData = {
        team_id: teamId,
        title: postForm.title,
        content: postForm.content,
        category: postForm.category,
        is_pinned: postForm.is_pinned,
        author_id: user?.id,
      };

      if (editingPost) {
        const { error } = await supabase
          .from('team_board_posts')
          .update(postData)
          .eq('id', editingPost.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('team_board_posts')
          .insert(postData);
        if (error) throw error;
      }

      setShowPostForm(false);
      resetPostForm();
      loadData();
    } catch (err: any) {
      alert('投稿に失敗しました: ' + err.message);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('この投稿を削除しますか？')) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('team_board_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      setSelectedPost(null);
      loadData();
    } catch (err: any) {
      alert('削除に失敗しました: ' + err.message);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPost || !newComment.trim()) return;

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('team_board_comments')
        .insert({
          post_id: selectedPost.id,
          content: newComment.trim(),
          author_id: user?.id,
        });

      if (error) throw error;
      setNewComment('');
      loadComments(selectedPost.id);
      loadData();
    } catch (err: any) {
      alert('コメントの投稿に失敗しました: ' + err.message);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">掲示板</h2>
        <button
          onClick={() => { resetPostForm(); setShowPostForm(true); }}
          className="px-3 sm:px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-xs sm:text-sm min-h-[44px]"
        >
          <span className="hidden sm:inline">投稿する</span>
          <span className="sm:hidden">+ 投稿</span>
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500">まだ投稿がありません</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => {
            const config = CATEGORY_CONFIG[post.category];
            return (
              <div
                key={post.id}
                onClick={() => handleSelectPost(post)}
                className={`bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow ${
                  post.is_pinned ? 'border-l-4 border-yellow-400' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {post.is_pinned && <span className="text-yellow-500">📌</span>}
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${config.bgColor} ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900">{post.title}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{post.content}</p>
                  </div>
                  <div className="ml-4 text-right text-sm text-gray-500">
                    <p>{formatDate(post.created_at)}</p>
                    {post.comment_count > 0 && (
                      <p className="text-primary mt-1">{post.comment_count}件</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 投稿詳細モーダル */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  {selectedPost.is_pinned && <span className="text-yellow-500">📌</span>}
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${CATEGORY_CONFIG[selectedPost.category].bgColor} ${CATEGORY_CONFIG[selectedPost.category].color}`}>
                    {CATEGORY_CONFIG[selectedPost.category].label}
                  </span>
                </div>
                <button onClick={() => setSelectedPost(null)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedPost.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{formatDate(selectedPost.created_at)}</p>
              <div className="text-gray-700 whitespace-pre-wrap">{selectedPost.content}</div>

              {(isManager || selectedPost.author_id === currentUserId) && (
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <button onClick={() => { openEditForm(selectedPost); setSelectedPost(null); }} className="text-primary text-sm">編集</button>
                  <button onClick={() => handleDeletePost(selectedPost.id)} className="text-red-600 text-sm">削除</button>
                </div>
              )}

              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold text-gray-900 mb-4">コメント ({comments.length})</h4>
                {comments.length > 0 && (
                  <div className="space-y-3 mb-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-700">{comment.content}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatDate(comment.created_at)}</p>
                      </div>
                    ))}
                  </div>
                )}
                <form onSubmit={handleSubmitComment} className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="コメントを入力..."
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  />
                  <button type="submit" disabled={!newComment.trim()} className="px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50">送信</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 投稿フォームモーダル */}
      {showPostForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">{editingPost ? '投稿を編集' : '新規投稿'}</h3>
                <button onClick={() => { setShowPostForm(false); resetPostForm(); }} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <form onSubmit={handleSubmitPost} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">タイトル *</label>
                  <input type="text" value={postForm.title} onChange={(e) => setPostForm({ ...postForm, title: e.target.value })} required className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
                  <select value={postForm.category} onChange={(e) => setPostForm({ ...postForm, category: e.target.value as PostCategory })} className="w-full px-4 py-2 border rounded-lg">
                    {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">内容 *</label>
                  <textarea value={postForm.content} onChange={(e) => setPostForm({ ...postForm, content: e.target.value })} required rows={6} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                {isManager && (
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={postForm.is_pinned} onChange={(e) => setPostForm({ ...postForm, is_pinned: e.target.checked })} className="rounded" />
                    <span className="text-sm text-gray-700">ピン留め</span>
                  </label>
                )}
                <button type="submit" className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-hover">{editingPost ? '更新' : '投稿'}</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
