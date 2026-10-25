import { useState, useEffect } from 'react';
import { UserPlus, Shield, User, Trash2, Edit2 } from 'lucide-react';
import api from '../../../services/api';
import { useToast } from '../../../context/ToastContext';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';

interface AdminUser {
    id: number;
    email: string;
    role: 'admin' | 'user';
    created_at: string;
}

export const UsersTab = () => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

    // Form states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'admin' | 'user'>('admin');
    const [saving, setSaving] = useState(false);

    // Confirm Delete Modal
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {}
    });

    const { showToast } = useToast();

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (err: any) {
            console.error('Failed to fetch users', err);
            showToast('Failed to load users list', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            await api.post('/users', { email, password, role });
            showToast('User created successfully', 'success');
            setIsCreateModalOpen(false);
            setEmail('');
            setPassword('');
            setRole('admin');
            fetchUsers();
        } catch (err: any) {
            showToast(err.response?.data?.message || 'Failed to create user', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        try {
            setSaving(true);
            const payload: any = { email, role };
            if (password.trim().length > 0) {
                payload.password = password;
            }
            await api.put(`/users/${selectedUser.id}`, payload);
            showToast('User updated successfully', 'success');
            setIsEditModalOpen(false);
            setSelectedUser(null);
            setEmail('');
            setPassword('');
            fetchUsers();
        } catch (err: any) {
            showToast(err.response?.data?.message || 'Failed to update user', 'error');
        } finally {
            setSaving(false);
        }
    };

    const openEditModal = (u: AdminUser) => {
        setSelectedUser(u);
        setEmail(u.email);
        setPassword('');
        setRole(u.role);
        setIsEditModalOpen(true);
    };

    const handleDelete = (u: AdminUser) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete User Account',
            message: `Are you sure you want to permanently delete the account "${u.email}"? This action cannot be undone.`,
            onConfirm: async () => {
                try {
                    await api.delete(`/users/${u.id}`);
                    showToast('User deleted successfully', 'success');
                    fetchUsers();
                } catch (err: any) {
                    showToast(err.response?.data?.message || 'Failed to delete user', 'error');
                }
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header / Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 p-6 rounded-2xl border border-white/10">
                <div>
                    <h2 className="text-xl font-serif text-[#D4AF37]">Administrative Users</h2>
                    <p className="text-gray-400 text-sm mt-1">Manage platform administrators and access privileges</p>
                </div>
                <button
                    onClick={() => {
                        setEmail('');
                        setPassword('');
                        setRole('admin');
                        setIsCreateModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] text-black font-semibold rounded-xl hover:bg-[#E5C158] transition-all shadow-lg shadow-[#D4AF37]/10"
                >
                    <UserPlus className="w-4 h-4" />
                    Add User
                </button>
            </div>

            {/* Users Table */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-[#D4AF37] bg-white/[0.02]">
                                <th className="p-4 pl-6">User</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Created Date</th>
                                <th className="p-4 pr-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-gray-500">
                                        Loading users...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-gray-500">
                                        No users registered in the system.
                                    </td>
                                </tr>
                            ) : (
                                users.map((u) => (
                                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="p-4 pl-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20 text-[#D4AF37]">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <span className="font-medium text-white">{u.email}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${u.role === 'admin' ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30' : 'bg-gray-500/10 text-gray-300'}`}>
                                                <Shield className="w-3 h-3" />
                                                {u.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-400">
                                            {new Date(u.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 pr-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(u)}
                                                    className="p-2 text-gray-400 hover:text-[#D4AF37] hover:bg-white/5 rounded-lg transition-colors"
                                                    title="Edit User"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(u)}
                                                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create User Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
                        <h3 className="text-xl font-serif text-[#D4AF37] mb-2">Create New User</h3>
                        <p className="text-gray-400 text-xs mb-6">Add credentials for a new dashboard administrator or team member.</p>

                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="user@autanagrouprd.com"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Role</label>
                                <select
                                    value={role}
                                    onChange={e => setRole(e.target.value as 'admin' | 'user')}
                                    className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                                >
                                    <option value="admin">Administrator (Full Access)</option>
                                    <option value="user">User (Standard Access)</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 text-sm text-gray-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-5 py-2 bg-[#D4AF37] text-black font-semibold rounded-xl hover:bg-[#E5C158] transition-colors disabled:opacity-50"
                                >
                                    {saving ? 'Creating...' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {isEditModalOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
                        <h3 className="text-xl font-serif text-[#D4AF37] mb-2">Edit User</h3>
                        <p className="text-gray-400 text-xs mb-6">Modify user details or leave password blank to keep current one.</p>

                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">New Password (Optional)</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Leave blank to keep unchanged"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Role</label>
                                <select
                                    value={role}
                                    onChange={e => setRole(e.target.value as 'admin' | 'user')}
                                    className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                                >
                                    <option value="admin">Administrator (Full Access)</option>
                                    <option value="user">User (Standard Access)</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditModalOpen(false);
                                        setSelectedUser(null);
                                    }}
                                    className="px-4 py-2 text-sm text-gray-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-5 py-2 bg-[#D4AF37] text-black font-semibold rounded-xl hover:bg-[#E5C158] transition-colors disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirm Delete Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                isDanger={true}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
};
