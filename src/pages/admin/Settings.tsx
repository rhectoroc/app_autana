import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Users, Database, HardDrive } from 'lucide-react';
import { UsersTab } from './settings/UsersTab';
import { BackupsTab } from './settings/BackupsTab';
import { StorageTab } from './settings/StorageTab';

export const Settings = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const tabFromUrl = searchParams.get('tab');
    
    const [activeTab, setActiveTab] = useState<'users' | 'backups' | 'storage'>(
        tabFromUrl === 'users' || tabFromUrl === 'backups' || tabFromUrl === 'storage' 
            ? tabFromUrl 
            : 'users'
    );

    useEffect(() => {
        if (tabFromUrl === 'users' || tabFromUrl === 'backups' || tabFromUrl === 'storage') {
            setActiveTab(tabFromUrl);
        }
    }, [tabFromUrl]);

    const handleTabChange = (tab: 'users' | 'backups' | 'storage') => {
        setActiveTab(tab);
        setSearchParams({ tab });
    };

    return (
        <div className="min-h-screen bg-neutral-900 text-white p-4 md:p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-4xl font-serif text-[#D4AF37] mb-2">System Settings</h1>
                    <p className="text-gray-400">Manage users, system backups and storage infrastructure</p>
                </header>

                {/* Sub-sections Tabs: USER | BACKUPS | STORAGE */}
                <div className="flex space-x-1 mb-8 bg-white/5 p-1 rounded-xl border border-white/10 w-fit">
                    <button
                        onClick={() => handleTabChange('users')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                            activeTab === 'users'
                                ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <Users className="w-4 h-4" />
                        Users
                    </button>
                    <button
                        onClick={() => handleTabChange('backups')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                            activeTab === 'backups'
                                ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <Database className="w-4 h-4" />
                        Backups
                    </button>
                    <button
                        onClick={() => handleTabChange('storage')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                            activeTab === 'storage'
                                ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <HardDrive className="w-4 h-4" />
                        Storage
                    </button>
                </div>

                {/* Tab Contents */}
                <div>
                    {activeTab === 'users' && <UsersTab />}
                    {activeTab === 'backups' && <BackupsTab />}
                    {activeTab === 'storage' && <StorageTab />}
                </div>
            </div>
        </div>
    );
};
