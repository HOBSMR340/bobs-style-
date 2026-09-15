import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { AdminUser, UserRole } from '../../types';
import {
  ShieldAlert,
  UserCheck,
  Plus,
  Key,
  CheckCircle2,
  Lock,
  Mail,
  User as UserIcon,
} from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const { currentUser, setCurrentUser, showToast, hasPermission } = useStore();

  const [usersList, setUsersList] = useState<AdminUser[]>([
    {
      id: 'usr-1',
      name: 'Amine Hadj',
      email: 'amine.admin@hobs-style.dz',
      role: 'super_admin',
      active: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'usr-2',
      name: 'Sofiane B.',
      email: 'sofiane.stock@hobs-style.dz',
      role: 'stock_manager',
      active: true,
      createdAt: '2026-03-24T10:15:00Z',
    },
    {
      id: 'usr-3',
      name: 'Yasmine K.',
      email: 'yasmine.sales@hobs-style.dz',
      role: 'sales',
      active: true,
      createdAt: '2026-03-25T08:30:00Z',
    },
    {
      id: 'usr-4',
      name: 'Karim M.',
      email: 'karim.manager@hobs-style.dz',
      role: 'manager',
      active: true,
      createdAt: '2026-03-20T09:00:00Z',
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('sales');

  const roleDescriptions: Record<UserRole, { title: string; desc: string; color: string }> = {
    super_admin: {
      title: 'Super Administrateur',
      desc: 'Accès complet et illimité : catalogue, stocks, prix, commandes, finances, utilisateurs et paramètres.',
      color: 'bg-purple-100 text-purple-800 border-purple-300',
    },
    manager: {
      title: 'Directeur Général (Manager)',
      desc: 'Supervision globale, validation commandes, gestion prix et statistiques complètes.',
      color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    },
    stock_manager: {
      title: 'Gestionnaire de Stock',
      desc: 'Gestion des réceptions, seuils d’alerte, variantes, catalogue produits et ajustements d’inventaire.',
      color: 'bg-amber-100 text-amber-800 border-amber-300',
    },
    sales: {
      title: 'Agent des Ventes / Support',
      desc: 'Traitement du flux de commandes, validation logistique, fiches clients et expédition.',
      color: 'bg-blue-100 text-blue-800 border-blue-300',
    },
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const newUser: AdminUser = {
      id: 'usr-' + Date.now(),
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      active: true,
      createdAt: new Date().toISOString(),
    };

    setUsersList([...usersList, newUser]);
    setIsModalOpen(false);
    setNewUserName('');
    setNewUserEmail('');
    showToast(`Collaborateur "${newUser.name}" ajouté avec succès !`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-950">
            Gestion des Utilisateurs & Droits d'Accès
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Rôles de sécurité (RBAC), contrôle des permissions et comptes de gestion de la boutique.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-950 text-white text-xs font-bold hover:bg-black"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un collaborateur</span>
        </button>
      </div>

      {/* Active Session Simulation Card */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-neutral-950 text-amber-400 flex items-center justify-center font-black">
              {currentUser.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-extrabold text-neutral-950 flex items-center gap-2">
                <span>Session Active : {currentUser.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  En ligne
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                Vous pouvez tester instantanément l'application sous différents profils de rôle :
              </p>
            </div>
          </div>
        </div>

        {/* Roles Quick Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
          {(['super_admin', 'manager', 'stock_manager', 'sales'] as UserRole[]).map((r) => {
            const info = roleDescriptions[r];
            const isCurrent = currentUser.role === r;
            return (
              <button
                key={r}
                onClick={() =>
                  setCurrentUser({
                    ...currentUser,
                    role: r,
                    name: info.title,
                  })
                }
                className={`p-4 rounded-xl border text-left transition-all ${
                  isCurrent
                    ? 'border-neutral-950 bg-neutral-900 text-white shadow-md'
                    : 'border-neutral-200 bg-neutral-50 hover:bg-white text-neutral-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs">{info.title}</span>
                  {isCurrent && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </div>
                <p className={`text-[11px] leading-relaxed ${isCurrent ? 'text-neutral-300' : 'text-neutral-500'}`}>
                  {info.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-neutral-200 bg-neutral-50 font-bold text-xs text-neutral-900">
          Équipe d'administration ({usersList.length})
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-500 font-bold uppercase text-[10px] bg-neutral-50">
                <th className="py-3 px-4">Collaborateur</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Rôle attribué</th>
                <th className="py-3 px-4">Date de création</th>
                <th className="py-3 px-4">État</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {usersList.map((usr) => (
                <tr key={usr.id} className="hover:bg-neutral-50/60">
                  <td className="py-3 px-4 font-bold text-neutral-900 flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-neutral-400" />
                    <span>{usr.name}</span>
                  </td>
                  <td className="py-3 px-4 text-neutral-600 font-mono text-[11px]">
                    {usr.email}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        roleDescriptions[usr.role].color
                      }`}
                    >
                      {roleDescriptions[usr.role].title}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-neutral-500 text-[11px]">
                    {new Date(usr.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-emerald-700 font-bold text-[11px]">Actif</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-base font-extrabold text-neutral-950">
              Nouveau compte collaborateur
            </h2>

            <form onSubmit={handleAddUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-800 mb-1">Nom & Prénom</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Ex: Bilal Zerrouki"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-800 mb-1">Email professionnel</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="bilal@hobs-style.dz"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-800 mb-1">Rôle</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-white"
                >
                  <option value="super_admin">Super Administrateur</option>
                  <option value="manager">Directeur Général (Manager)</option>
                  <option value="stock_manager">Gestionnaire de Stock</option>
                  <option value="sales">Agent des Ventes</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border text-neutral-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-neutral-950 text-white font-bold hover:bg-black"
                >
                  Créer le compte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
