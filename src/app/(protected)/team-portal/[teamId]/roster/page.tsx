'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type Player = {
  id: string;
  family_name: string;
  given_name: string;
  family_name_kana: string;
  given_name_kana: string;
  date_of_birth: string;
  grade: number;
  uniform_number: number | null;
  position: string | null;
  photo_url: string | null;
  is_active: boolean;
};

const POSITION_OPTIONS = [
  { value: 'GK', label: 'GK' },
  { value: 'DF', label: 'DF' },
  { value: 'MF', label: 'MF' },
  { value: 'FW', label: 'FW' },
];

const GRADE_OPTIONS = [
  { value: 1, label: '1年' },
  { value: 2, label: '2年' },
  { value: 3, label: '3年' },
  { value: 4, label: '4年' },
  { value: 5, label: '5年' },
  { value: 6, label: '6年' },
];

/**
 * チームポータル - 選手名簿ページ
 */
export default function RosterPage() {
  const params = useParams();
  const teamId = params.teamId as string;

  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [isManager, setIsManager] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  // 新規・編集フォーム
  const [formData, setFormData] = useState({
    family_name: '',
    given_name: '',
    family_name_kana: '',
    given_name_kana: '',
    date_of_birth: '',
    grade: 6,
    uniform_number: '',
    position: '',
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

      // 選手一覧取得
      const { data: playersData, error } = await supabase
        .from('players')
        .select('*')
        .eq('team_id', teamId)
        .eq('is_active', true)
        .order('uniform_number', { ascending: true, nullsFirst: false })
        .order('grade', { ascending: false })
        .order('family_name_kana', { ascending: true });

      if (error) throw error;
      setPlayers(playersData || []);
    } catch (err) {
      console.error('選手データの取得に失敗:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      family_name: '',
      given_name: '',
      family_name_kana: '',
      given_name_kana: '',
      date_of_birth: '',
      grade: 6,
      uniform_number: '',
      position: '',
    });
    setEditingPlayer(null);
  };

  const openEditForm = (player: Player) => {
    setFormData({
      family_name: player.family_name,
      given_name: player.given_name,
      family_name_kana: player.family_name_kana,
      given_name_kana: player.given_name_kana,
      date_of_birth: player.date_of_birth,
      grade: player.grade,
      uniform_number: player.uniform_number?.toString() || '',
      position: player.position || '',
    });
    setEditingPlayer(player);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const supabase = createClient();

      const playerData = {
        team_id: teamId,
        family_name: formData.family_name,
        given_name: formData.given_name,
        family_name_kana: formData.family_name_kana,
        given_name_kana: formData.given_name_kana,
        date_of_birth: formData.date_of_birth,
        grade: formData.grade,
        uniform_number: formData.uniform_number ? parseInt(formData.uniform_number) : null,
        position: formData.position || null,
      };

      if (editingPlayer) {
        const { error } = await supabase
          .from('players')
          .update(playerData)
          .eq('id', editingPlayer.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('players')
          .insert(playerData);
        if (error) throw error;
      }

      setShowForm(false);
      resetForm();
      loadData();
    } catch (err: any) {
      alert('選手の登録に失敗しました: ' + err.message);
    }
  };

  const handleDelete = async (playerId: string) => {
    if (!confirm('この選手を削除しますか？（非アクティブになります）')) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('players')
        .update({ is_active: false })
        .eq('id', playerId);

      if (error) throw error;
      setSelectedPlayer(null);
      loadData();
    } catch (err: any) {
      alert('削除に失敗しました: ' + err.message);
    }
  };

  const getAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const formatBirthDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">選手名簿</h2>
        {isManager && (
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            選手を追加
          </button>
        )}
      </div>

      {/* 選手数サマリー */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-6 text-sm">
          <span className="font-medium text-gray-900">登録選手数: {players.length}名</span>
          <span className="text-gray-500">
            学年別: {GRADE_OPTIONS.map(g => {
              const count = players.filter(p => p.grade === g.value).length;
              return count > 0 ? `${g.label}(${count})` : null;
            }).filter(Boolean).join(' / ')}
          </span>
        </div>
      </div>

      {players.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500">選手が登録されていません</p>
          {isManager && (
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              最初の選手を追加
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {players.map((player) => (
            <div
              key={player.id}
              onClick={() => setSelectedPlayer(player)}
              className="bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                {/* 背番号 */}
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  {player.uniform_number ? (
                    <span className="text-xl font-bold text-blue-600">{player.uniform_number}</span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {player.family_name} {player.given_name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {player.grade}年 {player.position && `· ${player.position}`}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 選手詳細モーダル */}
      {selectedPlayer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                    {selectedPlayer.uniform_number ? (
                      <span className="text-2xl font-bold text-blue-600">{selectedPlayer.uniform_number}</span>
                    ) : (
                      <span className="text-gray-400 text-xl">-</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedPlayer.family_name} {selectedPlayer.given_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedPlayer.family_name_kana} {selectedPlayer.given_name_kana}
                    </p>
                  </div>
                </div>
                <button onClick={() => setSelectedPlayer(null)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>

              <dl className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <dt className="text-gray-500">学年</dt>
                  <dd className="font-medium text-gray-900">{selectedPlayer.grade}年</dd>
                </div>
                {selectedPlayer.position && (
                  <div className="flex justify-between py-2 border-b">
                    <dt className="text-gray-500">ポジション</dt>
                    <dd className="font-medium text-gray-900">{selectedPlayer.position}</dd>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b">
                  <dt className="text-gray-500">生年月日</dt>
                  <dd className="font-medium text-gray-900">
                    {formatBirthDate(selectedPlayer.date_of_birth)}
                    <span className="text-gray-500 ml-2">({getAge(selectedPlayer.date_of_birth)}歳)</span>
                  </dd>
                </div>
                {selectedPlayer.uniform_number && (
                  <div className="flex justify-between py-2 border-b">
                    <dt className="text-gray-500">背番号</dt>
                    <dd className="font-medium text-gray-900">{selectedPlayer.uniform_number}</dd>
                  </div>
                )}
              </dl>

              {isManager && (
                <div className="flex gap-2 mt-6 pt-4 border-t">
                  <button
                    onClick={() => { openEditForm(selectedPlayer); setSelectedPlayer(null); }}
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(selectedPlayer.id)}
                    className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm"
                  >
                    削除
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 登録・編集フォームモーダル */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">{editingPlayer ? '選手情報を編集' : '選手を追加'}</h3>
                <button onClick={() => { setShowForm(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">姓 *</label>
                    <input
                      type="text"
                      value={formData.family_name}
                      onChange={(e) => setFormData({ ...formData, family_name: e.target.value })}
                      required
                      placeholder="山田"
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">名 *</label>
                    <input
                      type="text"
                      value={formData.given_name}
                      onChange={(e) => setFormData({ ...formData, given_name: e.target.value })}
                      required
                      placeholder="太郎"
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">セイ *</label>
                    <input
                      type="text"
                      value={formData.family_name_kana}
                      onChange={(e) => setFormData({ ...formData, family_name_kana: e.target.value })}
                      required
                      placeholder="ヤマダ"
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">メイ *</label>
                    <input
                      type="text"
                      value={formData.given_name_kana}
                      onChange={(e) => setFormData({ ...formData, given_name_kana: e.target.value })}
                      required
                      placeholder="タロウ"
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">生年月日 *</label>
                    <input
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                      required
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">学年 *</label>
                    <select
                      value={formData.grade}
                      onChange={(e) => setFormData({ ...formData, grade: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      {GRADE_OPTIONS.map((g) => (
                        <option key={g.value} value={g.value}>{g.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">背番号</label>
                    <input
                      type="number"
                      value={formData.uniform_number}
                      onChange={(e) => setFormData({ ...formData, uniform_number: e.target.value })}
                      min="1"
                      max="99"
                      placeholder="10"
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ポジション</label>
                    <select
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="">選択してください</option>
                      {POSITION_OPTIONS.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingPlayer ? '更新' : '登録'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
