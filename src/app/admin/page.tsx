'use client';

import { useState, useEffect } from 'react';
import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Appointment, AppointmentFormData } from '@/types';
import { useRouter } from 'next/navigation';

type DateFilter = 'all' | 'today' | 'week' | 'month' | 'custom';

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<AppointmentFormData>({
    clientName: '',
    email: '',
    carBrand: '',
    date: '',
    timeSlot: '',
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [dateFilterType, setDateFilterType] = useState<DateFilter>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [clients, setClients] = useState<Array<{ id: number; name: string; email: string }>>([]);
  const [useNewClientForm, setUseNewClientForm] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  // Vérifier l'authentification
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setCheckingAuth(false);
      } else {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAppointments();
      fetchClients();
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointments');
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des rendez-vous:', error);
      setMessage({ type: 'error', text: 'Erreur de chargement des rendez-vous' });
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des clients:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const url = editingId ? `/api/appointments/${editingId}` : '/api/appointments';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: editingId ? 'Rendez-vous modifié avec succès' : 'Rendez-vous ajouté avec succès' 
        });
        setFormData({ clientName: '', email: '', carBrand: '', date: '', timeSlot: '' });
        setShowAddForm(false);
        setEditingId(null);
        fetchAppointments();
      } else {
        setMessage({ type: 'error', text: data.error || 'Une erreur est survenue' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion au serveur' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingId(appointment.id);
    setFormData({
      clientName: appointment.clientName,
      email: appointment.email,
      carBrand: appointment.carBrand,
      date: format(parseISO(appointment.date), 'yyyy-MM-dd'),
      timeSlot: appointment.timeSlot,
    });
    setShowAddForm(true);
    setMessage(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Rendez-vous supprimé avec succès' });
        fetchAppointments();
      } else {
        setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion au serveur' });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setShowAddForm(false);
    setFormData({ clientName: '', email: '', carBrand: '', date: '', timeSlot: '' });
    setMessage(null);
  };

  const filteredAppointments = (() => {
    const today = new Date();
    
    switch (dateFilterType) {
      case 'today':
        return appointments.filter(apt => 
          format(parseISO(apt.date), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
        );
      
      case 'week':
        const weekStart = startOfWeek(today, { locale: fr });
        const weekEnd = endOfWeek(today, { locale: fr });
        return appointments.filter(apt => 
          isWithinInterval(parseISO(apt.date), { start: weekStart, end: weekEnd })
        );
      
      case 'month':
        const monthStart = startOfMonth(today);
        const monthEnd = endOfMonth(today);
        return appointments.filter(apt => 
          isWithinInterval(parseISO(apt.date), { start: monthStart, end: monthEnd })
        );
      
      case 'custom':
        if (customStartDate && customEndDate) {
          const start = parseISO(customStartDate);
          const end = parseISO(customEndDate);
          return appointments.filter(apt => 
            isWithinInterval(parseISO(apt.date), { start, end })
          );
        }
        return appointments;
      
      default:
        return appointments;
    }
  })();

  const groupedAppointments = filteredAppointments.reduce((acc, apt) => {
    const dateKey = format(parseISO(apt.date), 'yyyy-MM-dd');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(apt);
    return acc;
  }, {} as Record<string, Appointment[]>);

  // Afficher un loader pendant la vérification de l'authentification
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Tableau de bord administratif
              </h1>
              <p className="text-gray-600 mt-1">Gestion des rendez-vous Pneux Express</p>
              {user && (
                <p className="text-sm text-gray-500 mt-1">
                  Connecté en tant que <strong>{user.name}</strong> ({user.email})
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <a
                href="/reserver"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
              >
                <span>←</span>
                <span>Accueil</span>
              </a>
              <a
                href="/a-propos"
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors font-medium"
              >
                <span>ℹ️</span>
                <span>À propos</span>
              </a>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Filtres et actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="space-y-4">
            {/* Filtres rapides */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Période d'affichage:
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setDateFilterType('all')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    dateFilterType === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Tous
                </button>
                <button
                  onClick={() => setDateFilterType('today')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    dateFilterType === 'today'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Aujourd'hui
                </button>
                <button
                  onClick={() => setDateFilterType('week')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    dateFilterType === 'week'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cette semaine
                </button>
                <button
                  onClick={() => setDateFilterType('month')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    dateFilterType === 'month'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Ce mois
                </button>
                <button
                  onClick={() => setDateFilterType('custom')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    dateFilterType === 'custom'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Plage personnalisée
                </button>
              </div>
            </div>

            {/* Plage de dates personnalisée */}
            {dateFilterType === 'custom' && (
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de début:
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de fin:
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>
                {(customStartDate || customEndDate) && (
                  <button
                    onClick={() => {
                      setCustomStartDate('');
                      setCustomEndDate('');
                    }}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Réinitialiser
                  </button>
                )}
              </div>
            )}

            {/* Bouton d'ajout */}
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowAddForm(!showAddForm);
                  setEditingId(null);
                  setFormData({ clientName: '', email: '', carBrand: '', date: '', timeSlot: '' });
                  setUseNewClientForm(true);
                  setSelectedClientId(null);
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-md"
              >
                {showAddForm ? 'Annuler' : '+ Nouveau rendez-vous'}
              </button>
            </div>
          </div>
        </div>

        {/* Formulaire d'ajout/édition */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {editingId ? 'Modifier le rendez-vous' : 'Ajouter un rendez-vous'}
            </h2>

            {/* Sélecteur nouveau client ou client existant */}
            {!editingId && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Type de client:
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setUseNewClientForm(true);
                      setSelectedClientId(null);
                      setFormData({ clientName: '', email: '', carBrand: '', date: '', timeSlot: '' });
                    }}
                    className={`flex-1 px-4 py-2 rounded-md transition-colors ${
                      useNewClientForm
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Nouveau client
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUseNewClientForm(false);
                      setFormData({ clientName: '', email: '', carBrand: '', date: '', timeSlot: '' });
                    }}
                    className={`flex-1 px-4 py-2 rounded-md transition-colors ${
                      !useNewClientForm
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Client existant
                  </button>
                </div>
              </div>
            )}

            {/* Sélecteur de client existant */}
            {!editingId && !useNewClientForm && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sélectionner un client *
                </label>
                <select
                  required={!useNewClientForm}
                  value={selectedClientId || ''}
                  onChange={(e) => {
                    const clientId = Number(e.target.value);
                    setSelectedClientId(clientId);
                    const selectedClient = clients.find(c => c.id === clientId);
                    if (selectedClient) {
                      setFormData({
                        ...formData,
                        clientName: selectedClient.name,
                        email: selectedClient.email,
                      });
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-black"
                >
                  <option value="">Choisir un client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name} - {client.email}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du client *
                </label>
                <input
                  type="text"
                  required
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  disabled={!editingId && !useNewClientForm}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-black disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Courriel *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!editingId && !useNewClientForm}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-black disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marque de voiture *
                </label>
                <input
                  type="text"
                  required
                  value={formData.carBrand}
                  onChange={(e) => setFormData({ ...formData, carBrand: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Heure *
                </label>
                <select
                  required
                  value={formData.timeSlot}
                  onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-black"
                >
                  <option value="">Sélectionner une heure</option>
                  {Array.from({ length: 8 }, (_, i) => {
                    const hour = 8 + i;
                    const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
                    return (
                      <option key={timeSlot} value={timeSlot}>
                        {timeSlot}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
                >
                  {loading ? 'Enregistrement...' : editingId ? 'Modifier' : 'Ajouter'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des rendez-vous */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Rendez-vous planifiés ({filteredAppointments.length})
          </h2>
          
          {loading ? (
            <p className="text-gray-600 text-center py-8">Chargement...</p>
          ) : Object.keys(groupedAppointments).length === 0 ? (
            <p className="text-gray-600 text-center py-8">Aucun rendez-vous trouvé</p>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedAppointments)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([date, appts]) => (
                  <div key={date} className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-semibold text-lg text-gray-800 mb-3">
                      {format(parseISO(date), 'EEEE d MMMM yyyy', { locale: fr })}
                    </h3>
                    <div className="space-y-3">
                      {appts
                        .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot))
                        .map((appointment) => (
                          <div
                            key={appointment.id}
                            className="bg-gray-50 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                  {appointment.timeSlot}
                                </span>
                                <span className="font-semibold text-gray-900">
                                  {appointment.clientName}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                <p>📧 {appointment.email}</p>
                                <p>🚗 {appointment.carBrand}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(appointment)}
                                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors text-sm"
                              >
                                Modifier
                              </button>
                              <button
                                onClick={() => handleDelete(appointment.id)}
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
                              >
                                Supprimer
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Statistiques */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total rendez-vous</h3>
            <p className="text-3xl font-bold text-blue-600">{appointments.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Rendez-vous aujourd'hui</h3>
            <p className="text-3xl font-bold text-green-600">
              {appointments.filter(apt => 
                format(parseISO(apt.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
              ).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Dates uniques</h3>
            <p className="text-3xl font-bold text-purple-600">
              {Object.keys(groupedAppointments).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
