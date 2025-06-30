'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  Trash2, 
  Shield, 
  Mail, 
  Calendar,
  Eye,
  Lock,
  Unlock,
  MoreHorizontal,
  UserPlus,
  Download
} from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'moderator' | 'user' | 'viewer'
  status: 'active' | 'inactive' | 'suspended'
  lastLogin: string
  joinDate: string
  apiCalls: number
  permissions: string[]
}

interface UserManagementProps {
  currentUserRole?: 'admin' | 'moderator'
}

export function UserManagement({ currentUserRole = 'admin' }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: '山田太郎',
      email: 'yamada@example.com',
      role: 'admin',
      status: 'active',
      lastLogin: '2024-12-30 14:30',
      joinDate: '2024-01-15',
      apiCalls: 15624,
      permissions: ['read', 'write', 'delete', 'admin']
    },
    {
      id: '2',
      name: '佐藤花子',
      email: 'sato@example.com',
      role: 'moderator',
      status: 'active',
      lastLogin: '2024-12-30 12:15',
      joinDate: '2024-03-10',
      apiCalls: 8945,
      permissions: ['read', 'write', 'moderate']
    },
    {
      id: '3',
      name: '田中一郎',
      email: 'tanaka@example.com',
      role: 'user',
      status: 'active',
      lastLogin: '2024-12-29 18:45',
      joinDate: '2024-06-22',
      apiCalls: 2847,
      permissions: ['read', 'write']
    },
    {
      id: '4',
      name: '鈴木美咲',
      email: 'suzuki@example.com',
      role: 'viewer',
      status: 'inactive',
      lastLogin: '2024-12-25 09:20',
      joinDate: '2024-11-08',
      apiCalls: 456,
      permissions: ['read']
    }
  ])

  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [showUserModal, setShowUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [sortBy, setSortBy] = useState<'name' | 'joinDate' | 'lastLogin' | 'apiCalls'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Filter and sort users
  const filteredUsers = users
    .filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesRole = roleFilter === 'all' || user.role === roleFilter
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter
      return matchesSearch && matchesRole && matchesStatus
    })
    .sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortBy) {
        case 'name':
          aValue = a.name
          bValue = b.name
          break
        case 'joinDate':
          aValue = new Date(a.joinDate)
          bValue = new Date(b.joinDate)
          break
        case 'lastLogin':
          aValue = new Date(a.lastLogin)
          bValue = new Date(b.lastLogin)
          break
        case 'apiCalls':
          aValue = a.apiCalls
          bValue = b.apiCalls
          break
        default:
          aValue = a.name
          bValue = b.name
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  const handleUserAction = (action: string, userId: string) => {
    switch (action) {
      case 'edit':
        const user = users.find(u => u.id === userId)
        if (user) {
          setEditingUser(user)
          setShowUserModal(true)
        }
        break
      case 'suspend':
        setUsers(users.map(u => 
          u.id === userId 
            ? { ...u, status: u.status === 'suspended' ? 'active' : 'suspended' as const }
            : u
        ))
        break
      case 'delete':
        if (confirm('このユーザーを削除してもよろしいですか？')) {
          setUsers(users.filter(u => u.id !== userId))
        }
        break
    }
  }

  const bulkActions = [
    { id: 'activate', label: 'アクティブ化', icon: Unlock },
    { id: 'suspend', label: '停止', icon: Lock },
    { id: 'delete', label: '削除', icon: Trash2 },
    { id: 'export', label: 'エクスポート', icon: Download },
  ]

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-red-600 bg-red-100 dark:bg-red-900/20'
      case 'moderator': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20'
      case 'user': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20'
      case 'viewer': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100 dark:bg-green-900/20'
      case 'inactive': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
      case 'suspended': return 'text-red-600 bg-red-100 dark:bg-red-900/20'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20">
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              ユーザー管理
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filteredUsers.length} / {users.length} ユーザー
            </p>
          </div>
        </div>

        {currentUserRole === 'admin' && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setEditingUser(null)
              setShowUserModal(true)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:shadow-lg transition-all"
          >
            <UserPlus className="w-4 h-4" />
            新規ユーザー
          </motion.button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-white/20">
        {/* Search */}
        <div className="flex-1 min-w-64 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="名前またはメールアドレスで検索..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/50 dark:bg-gray-700/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
          />
        </div>

        {/* Role Filter */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-white/50 dark:bg-gray-700/50 border border-white/20 text-sm"
        >
          <option value="all">全ての権限</option>
          <option value="admin">管理者</option>
          <option value="moderator">モデレーター</option>
          <option value="user">ユーザー</option>
          <option value="viewer">閲覧者</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-white/50 dark:bg-gray-700/50 border border-white/20 text-sm"
        >
          <option value="all">全てのステータス</option>
          <option value="active">アクティブ</option>
          <option value="inactive">非アクティブ</option>
          <option value="suspended">停止中</option>
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 rounded-lg bg-white/50 dark:bg-gray-700/50 border border-white/20 text-sm"
        >
          <option value="name">名前順</option>
          <option value="joinDate">登録日順</option>
          <option value="lastLogin">最終ログイン順</option>
          <option value="apiCalls">API使用数順</option>
        </select>

        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <div className={`w-4 h-4 border-l-2 border-b-2 border-gray-400 transform transition-transform ${
            sortOrder === 'asc' ? 'rotate-45' : '-rotate-45'
          }`} />
        </button>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex items-center gap-2 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg"
        >
          <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
            {selectedUsers.length}件選択中:
          </span>
          {bulkActions.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.id}
                className="flex items-center gap-1 px-3 py-1 text-xs bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <Icon className="w-3 h-3" />
                {action.label}
              </button>
            )
          })}
        </motion.div>
      )}

      {/* Users Table */}
      <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 dark:bg-gray-700/50">
              <tr>
                <th className="p-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(filteredUsers.map(u => u.id))
                      } else {
                        setSelectedUsers([])
                      }
                    }}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                </th>
                <th className="p-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  ユーザー
                </th>
                <th className="p-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  権限
                </th>
                <th className="p-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  ステータス
                </th>
                <th className="p-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  最終ログイン
                </th>
                <th className="p-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  API使用数
                </th>
                <th className="p-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  アクション
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
              {filteredUsers.map((user) => (
                <motion.tr
                  key={user.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-white/30 dark:hover:bg-gray-700/30 transition-colors"
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers([...selectedUsers, user.id])
                        } else {
                          setSelectedUsers(selectedUsers.filter(id => id !== user.id))
                        }
                      }}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                    {user.lastLogin}
                  </td>
                  <td className="p-4 text-sm text-gray-900 dark:text-white font-medium">
                    {user.apiCalls.toLocaleString()}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUserAction('edit', user.id)}
                        className="p-1 rounded hover:bg-blue-500/20 text-blue-600 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleUserAction('suspend', user.id)}
                        className="p-1 rounded hover:bg-yellow-500/20 text-yellow-600 transition-colors"
                      >
                        {user.status === 'suspended' ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </button>
                      {currentUserRole === 'admin' && user.role !== 'admin' && (
                        <button
                          onClick={() => handleUserAction('delete', user.id)}
                          className="p-1 rounded hover:bg-red-500/20 text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            ユーザーが見つかりません
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            検索条件を変更するか、新しいユーザーを追加してください。
          </p>
        </motion.div>
      )}

      {/* User Modal */}
      <AnimatePresence>
        {showUserModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {editingUser ? 'ユーザー編集' : '新規ユーザー'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    名前
                  </label>
                  <input
                    type="text"
                    defaultValue={editingUser?.name || ''}
                    className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    defaultValue={editingUser?.email || ''}
                    className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    権限
                  </label>
                  <select
                    defaultValue={editingUser?.role || 'user'}
                    className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="viewer">閲覧者</option>
                    <option value="user">ユーザー</option>
                    <option value="moderator">モデレーター</option>
                    {currentUserRole === 'admin' && <option value="admin">管理者</option>}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowUserModal(false)}
                  className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                >
                  {editingUser ? '更新' : '作成'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}