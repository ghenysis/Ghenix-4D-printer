import React, { useEffect, useState } from 'react';
import { Order } from '../../types';
import { UserProfile } from '../../types/auth';
import {
  DeliveryTaskStatus,
  PrepStatus,
  createDriver,
  deliveryOf,
  fulfillmentOf,
  getPricing,
  getUsers,
  listByRole,
  ordersForDriver,
  ordersForUser,
  prepOf,
  savePricing,
  setArticleBasePrice,
  setDeliveryTask,
  setPrepStatus,
  assignDriver,
  updateAccount,
  ExtraFee,
  PricingConfig
} from '../../services/accountOps';
import { getStoredCatalog, getStoredOrders } from '../../services/storage';
import { X } from 'lucide-react';

const PREP_LABEL: Record<PrepStatus, string> = {
  received: 'Reçue',
  printing: 'En impression',
  ready: 'Prête'
};

const DELIVERY_LABEL: Record<DeliveryTaskStatus, string> = {
  waiting: 'En attente',
  assigned: 'Attribuée',
  en_route: 'En route',
  delivered: 'Livrée',
  ready_pickup: 'Prête en magasin',
  picked_up: 'Retirée'
};

function OrderCard({ order }: { order: Order }) {
  const kind = fulfillmentOf(order);
  return (
    <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-1">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs font-bold text-slate-900">{order.reference}</span>
        <span className="text-[10px] uppercase tracking-wide font-bold text-slate-500">
          {kind === 'pickup' ? 'Retrait magasin' : 'Livraison'}
        </span>
      </div>
      <p className="text-xs text-slate-700">
        {order.items.map((i) => `${i.quantity}× ${i.article.name}`).join(', ')}
      </p>
      <p className="text-[11px] text-slate-500">
        Préparation : <b>{PREP_LABEL[prepOf(order)]}</b>
        {' · '}
        Remise : <b>{DELIVERY_LABEL[deliveryOf(order)]}</b>
      </p>
      <p className="text-[11px] font-mono text-slate-900">{order.total.toFixed(2)} € TTC</p>
    </div>
  );
}

export const ClientOrdersModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
}> = ({ isOpen, onClose, user }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => {
    if (isOpen) setOrders(ordersForUser(user));
  }, [isOpen, user]);
  if (!isOpen || !user) return null;
  const active = orders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled');
  const past = orders.filter((o) => o.status === 'completed' || o.status === 'cancelled');
  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <header className="flex items-center justify-between px-4 py-3 border-b">
          <div>
            <h2 className="text-sm font-bold">Mes commandes</h2>
            <p className="text-[11px] text-slate-500">{user.name} · {user.email}</p>
          </div>
          <button onClick={onClose} className="p-1"><X className="w-4 h-4" /></button>
        </header>
        <div className="p-4 overflow-y-auto space-y-4 text-xs">
          <section className="space-y-2">
            <h3 className="font-bold text-slate-800">En cours</h3>
            {active.length === 0 && <p className="text-slate-500">Aucune commande en cours.</p>}
            {active.map((o) => <OrderCard key={o.id} order={o} />)}
          </section>
          <section className="space-y-2">
            <h3 className="font-bold text-slate-800">Historique</h3>
            {past.length === 0 && <p className="text-slate-500">Pas encore de commande terminée.</p>}
            {past.map((o) => <OrderCard key={o.id} order={o} />)}
          </section>
        </div>
      </div>
    </div>
  );
};

export const DriverBoardModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
}> = ({ isOpen, onClose, user }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const reload = () => setOrders(ordersForDriver(user));
  useEffect(() => {
    if (isOpen) reload();
  }, [isOpen, user]);
  if (!isOpen || !user) return null;
  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <header className="flex items-center justify-between px-4 py-3 border-b">
          <div>
            <h2 className="text-sm font-bold">Mes livraisons</h2>
            <p className="text-[11px] text-slate-500">{user.name}</p>
          </div>
          <button onClick={onClose} className="p-1"><X className="w-4 h-4" /></button>
        </header>
        <div className="p-4 overflow-y-auto space-y-3">
          {orders.length === 0 && <p className="text-xs text-slate-500">Aucune tournée attribuée.</p>}
          {orders.map((o) => (
            <div key={o.id} className="border rounded-xl p-3 space-y-2 text-xs">
              <div className="font-mono font-bold">{o.reference}</div>
              <p>{o.customer.fullName} · {o.customer.phone}</p>
              <p className="text-slate-600">
                {o.customer.address?.street}, {o.customer.address?.zipCode} {o.customer.address?.city}
              </p>
              <p>Statut : <b>{DELIVERY_LABEL[deliveryOf(o)]}</b></p>
              <div className="flex gap-2">
                <button
                  className="px-2 py-1 rounded-lg bg-slate-100"
                  onClick={() => { setDeliveryTask(o.id, 'en_route', user.name); reload(); }}
                >En route</button>
                <button
                  className="px-2 py-1 rounded-lg bg-slate-900 text-white"
                  onClick={() => { setDeliveryTask(o.id, 'delivered', user.name); reload(); }}
                >Livrée</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const OpsAdminPanel: React.FC<{ onCatalogPricesChanged?: () => void }> = ({ onCatalogPricesChanged }) => {
  const [pricing, setPricing] = useState<PricingConfig>(getPricing());
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<UserProfile[]>([]);
  const [accounts, setAccounts] = useState<UserProfile[]>([]);
  const [accountFilter, setAccountFilter] = useState<'all' | 'admin' | 'client' | 'livreur'>('all');
  const [catalog, setCatalog] = useState(getStoredCatalog());
  const [driverForm, setDriverForm] = useState({ name: '', email: '', phone: '' });
  const [feeLabel, setFeeLabel] = useState('');
  const [feeAmount, setFeeAmount] = useState('0');
  const [kindFilter, setKindFilter] = useState<'all' | 'delivery' | 'pickup'>('all');

  const reload = () => {
    setPricing(getPricing());
    setOrders(getStoredOrders());
    setDrivers(listByRole('livreur'));
    setAccounts(getUsers());
    setCatalog(getStoredCatalog());
  };
  useEffect(() => { reload(); }, []);

  const persistPricing = (next: PricingConfig) => {
    setPricing(savePricing(next));
  };

  const visible = orders.filter((o) => kindFilter === 'all' || fulfillmentOf(o) === kindFilter);

  return (
    <div className="p-4 sm:p-6 space-y-6 text-xs overflow-y-auto">
      <section className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold">Comptes</h3>
            <p className="text-[11px] text-slate-500">Identifiant admin de référence : <b className="font-mono">ADM-0001</b></p>
          </div>
          <select className="border rounded-lg px-2 py-1" value={accountFilter} onChange={(e) => setAccountFilter(e.target.value as typeof accountFilter)}>
            <option value="all">Tous</option>
            <option value="admin">Admins</option>
            <option value="client">Clients</option>
            <option value="livreur">Livreurs</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-[10px] uppercase text-slate-400">
              <tr>
                <th className="py-1 pr-2">Identifiant</th>
                <th className="py-1 pr-2">Nom</th>
                <th className="py-1 pr-2">Rôle</th>
                <th className="py-1 pr-2">État</th>
              </tr>
            </thead>
            <tbody>
              {accounts.filter((a) => accountFilter === 'all' || a.role === accountFilter).map((a) => (
                <tr key={a.id} className="border-t border-slate-100">
                  <td className="py-2 pr-2 font-mono font-bold">{a.accountCode || '—'}</td>
                  <td className="py-2 pr-2">
                    <div>{a.name}</div>
                    <div className="text-slate-400">{a.email}</div>
                  </td>
                  <td className="py-2 pr-2">
                    <select
                      className="border rounded-lg px-1 py-1"
                      value={a.role}
                      onChange={(e) => { updateAccount(a.id, { role: e.target.value as UserProfile['role'] }); reload(); }}
                    >
                      <option value="client">Client</option>
                      <option value="livreur">Livreur</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="py-2">
                    <button
                      className={`px-2 py-1 rounded-lg ${a.active === false ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'}`}
                      onClick={() => { updateAccount(a.id, { active: a.active === false }); reload(); }}
                    >
                      {a.active === false ? 'Inactif' : 'Actif'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {accounts.length === 0 && <p className="text-slate-500">Aucun compte enregistré. Une commande ou une connexion en crée un.</p>}
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
        <h3 className="text-sm font-bold">Tarification</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="space-y-1">
            <span className="text-slate-500">TVA (ex. 0.20)</span>
            <input className="w-full border rounded-lg px-2 py-1.5" type="number" step="0.01" value={pricing.vatRate}
              onChange={(e) => persistPricing({ ...pricing, vatRate: Number(e.target.value) })} />
          </label>
          <label className="space-y-1">
            <span className="text-slate-500">Livraison standard €</span>
            <input className="w-full border rounded-lg px-2 py-1.5" type="number" step="0.1" value={pricing.deliveryStandard}
              onChange={(e) => persistPricing({ ...pricing, deliveryStandard: Number(e.target.value) })} />
          </label>
          <label className="space-y-1">
            <span className="text-slate-500">Livraison express €</span>
            <input className="w-full border rounded-lg px-2 py-1.5" type="number" step="0.1" value={pricing.deliveryExpress}
              onChange={(e) => persistPricing({ ...pricing, deliveryExpress: Number(e.target.value) })} />
          </label>
        </div>
        <div className="flex gap-2 items-end">
          <input className="border rounded-lg px-2 py-1.5 flex-1" placeholder="Frais (nom)" value={feeLabel} onChange={(e) => setFeeLabel(e.target.value)} />
          <input className="border rounded-lg px-2 py-1.5 w-24" type="number" value={feeAmount} onChange={(e) => setFeeAmount(e.target.value)} />
          <button
            className="px-3 py-1.5 bg-slate-900 text-white rounded-lg font-bold"
            onClick={() => {
              if (!feeLabel.trim()) return;
              const fee: ExtraFee = { id: `fee-${Date.now()}`, label: feeLabel.trim(), amount: Number(feeAmount) || 0 };
              persistPricing({ ...pricing, extraFees: [...pricing.extraFees, fee] });
              setFeeLabel('');
            }}
          >Ajouter</button>
        </div>
        <ul className="space-y-1">
          {pricing.extraFees.map((f) => (
            <li key={f.id} className="flex justify-between">
              <span>{f.label}</span>
              <button className="text-rose-600" onClick={() => persistPricing({ ...pricing, extraFees: pricing.extraFees.filter((x) => x.id !== f.id) })}>
                {f.amount.toFixed(2)} € · retirer
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
        <h3 className="text-sm font-bold">Prix articles (base)</h3>
        {catalog.map((a) => (
          <label key={a.id} className="flex items-center justify-between gap-3">
            <span>{a.name}</span>
            <input
              className="border rounded-lg px-2 py-1 w-24 font-mono"
              type="number"
              step="0.1"
              defaultValue={a.basePrice}
              onBlur={(e) => {
                setArticleBasePrice(a.id, Number(e.target.value));
                onCatalogPricesChanged?.();
                reload();
              }}
            />
          </label>
        ))}
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
        <h3 className="text-sm font-bold">Comptes livreurs</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          <input className="border rounded-lg px-2 py-1.5" placeholder="Nom" value={driverForm.name} onChange={(e) => setDriverForm({ ...driverForm, name: e.target.value })} />
          <input className="border rounded-lg px-2 py-1.5" placeholder="Email" value={driverForm.email} onChange={(e) => setDriverForm({ ...driverForm, email: e.target.value })} />
          <input className="border rounded-lg px-2 py-1.5" placeholder="Téléphone" value={driverForm.phone} onChange={(e) => setDriverForm({ ...driverForm, phone: e.target.value })} />
          <button
            className="bg-slate-900 text-white rounded-lg font-bold"
            onClick={() => {
              if (!driverForm.name.trim() || !driverForm.email.trim()) return;
              createDriver(driverForm);
              setDriverForm({ name: '', email: '', phone: '' });
              reload();
            }}
          >Créer</button>
        </div>
        <ul className="space-y-1">
          {drivers.map((d) => (
            <li key={d.id}>{d.name} · {d.email}</li>
          ))}
          {drivers.length === 0 && <li className="text-slate-500">Aucun livreur.</li>}
        </ul>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold">Commandes par type</h3>
          <select className="border rounded-lg px-2 py-1" value={kindFilter} onChange={(e) => setKindFilter(e.target.value as typeof kindFilter)}>
            <option value="all">Toutes</option>
            <option value="delivery">À livrer</option>
            <option value="pickup">Retrait magasin</option>
          </select>
        </div>
        {visible.map((o) => (
          <div key={o.id} className="border rounded-xl p-3 space-y-2">
            <div className="flex justify-between">
              <b className="font-mono">{o.reference}</b>
              <span>{fulfillmentOf(o) === 'pickup' ? 'Retrait' : 'Livraison'} · {o.customer.fullName}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(['received', 'printing', 'ready'] as PrepStatus[]).map((p) => (
                <button key={p} className="px-2 py-1 rounded-lg bg-slate-100" onClick={() => { setPrepStatus(o.id, p); reload(); }}>
                  {PREP_LABEL[p]}
                </button>
              ))}
            </div>
            {fulfillmentOf(o) === 'delivery' && (
              <div className="flex gap-2 items-center">
                <select
                  className="border rounded-lg px-2 py-1 flex-1"
                  defaultValue={o.driverId || ''}
                  onChange={(e) => { if (e.target.value) { assignDriver(o.id, e.target.value); reload(); } }}
                >
                  <option value="">Attribuer un livreur</option>
                  {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <span className="text-slate-500">{o.driverName || 'non attribué'}</span>
              </div>
            )}
            {fulfillmentOf(o) === 'pickup' && (
              <div className="flex gap-2">
                <button className="px-2 py-1 rounded-lg bg-slate-100" onClick={() => { setDeliveryTask(o.id, 'ready_pickup', 'Atelier'); reload(); }}>Prêt au comptoir</button>
                <button className="px-2 py-1 rounded-lg bg-slate-900 text-white" onClick={() => { setDeliveryTask(o.id, 'picked_up', 'Atelier'); reload(); }}>Retiré</button>
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  );
};
