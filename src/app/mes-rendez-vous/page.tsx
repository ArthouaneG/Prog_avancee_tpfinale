'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format, parseISO, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Appointment } from '@/types';

export default function MesRendezVousPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    date: '',
    timeSlot: '',
  });
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

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

  useEffect(() => {
    if (user) {
      fetchMyAppointments();
    }
  }, [user]);

  const fetchMyAppointments = async () => {
    try {
      const response = await fetch('/api/appointments/my');
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des rendez-vous:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const handleCancelAppointment = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Rendez-vous annulé avec succès');
        fetchMyAppointments();
      } else {
        alert('Erreur lors de l\'annulation');
      }
    } catch (error) {
      alert('Erreur de connexion au serveur');
    }
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingId(appointment.id);
    setEditForm({
      date: format(parseISO(appointment.date), 'yyyy-MM-dd'),
      timeSlot: appointment.timeSlot,
    });
    fetchAvailableSlots(format(parseISO(appointment.date), 'yyyy-MM-dd'));
  };

  const fetchAvailableSlots = async (date: string) => {
    try {
      const response = await fetch(`/api/availability?date=${date}`);
      const data = await response.json();
      setAvailableSlots(data.slots || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des créneaux:', error);
      setAvailableSlots([]);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    try {
      const response = await fetch(`/api/appointments/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: editForm.date,
          timeSlot: editForm.timeSlot,
        }),
      });

      if (response.ok) {
        alert('Rendez-vous modifié avec succès');
        setEditingId(null);
        fetchMyAppointments();
      } else {
        const data = await response.json();
        alert(data.error || 'Erreur lors de la modification');
      }
    } catch (error) {
      alert('Erreur de connexion au serveur');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ date: '', timeSlot: '' });
    setAvailableSlots([]);
  };

  const isWeekend = (dateString: string) => {
    const date = parseISO(dateString);
    const day = date.getDay();
    return day === 0 || day === 6; // Dimanche = 0, Samedi = 6
  };

  // Générer les 30 prochains jours pour le sélecteur de date
  const next30Days = Array.from({ length: 30 }, (_, i) => {
    const date = addDays(new Date(), i);
    return format(date, 'yyyy-MM-dd');
  }).filter(date => !isWeekend(date));

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* En-tête */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Mes rendez-vous
              </h1>
              <p className="text-gray-600 mt-1">Pneux Express</p>
              {user && (
                <p className="text-sm text-gray-500 mt-1">
                  Bienvenue, <strong>{user.name}</strong> ({user.email})
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <a
                href="/reserver"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
              >
                <span>🏠</span>
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
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>

        {/* Liste des rendez-vous */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Vos rendez-vous ({appointments.length})
          </h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Chargement...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📅</div>
              <p className="text-gray-600 text-lg mb-4">
                Vous n'avez aucun rendez-vous pour le moment
              </p>
              <a
                href="/"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Réserver un rendez-vous
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => {
                const appointmentDate = parseISO(appointment.date);
                const isPast = appointmentDate < new Date();
                
                return (
                  <div
                    key={appointment.id}
                    className={`border rounded-lg p-5 transition-all ${
                      isPast
                        ? 'bg-gray-50 border-gray-200'
                        : 'bg-blue-50 border-blue-200 hover:shadow-md'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        {editingId === appointment.id ? (
                          /* Mode édition */
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                              Modifier le rendez-vous - {appointment.carBrand}
                            </h3>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nouvelle date
                              </label>
                              <select
                                value={editForm.date}
                                onChange={(e) => {
                                  setEditForm({ ...editForm, date: e.target.value, timeSlot: '' });
                                  fetchAvailableSlots(e.target.value);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-black"
                              >
                                <option value="">Sélectionner une date</option>
                                {next30Days.map((date) => (
                                  <option key={date} value={date}>
                                    {format(parseISO(date), 'EEEE d MMMM yyyy', { locale: fr })}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {editForm.date && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Nouveau créneau
                                </label>
                                {availableSlots.length > 0 ? (
                                  <div className="grid grid-cols-4 gap-2">
                                    {availableSlots.map((slot) => (
                                      <button
                                        key={slot}
                                        type="button"
                                        onClick={() => setEditForm({ ...editForm, timeSlot: slot })}
                                        className={`p-2 rounded-md text-sm font-medium transition-all ${
                                          editForm.timeSlot === slot
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-800'
                                        }`}
                                      >
                                        {slot}
                                      </button>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500 italic">
                                    Aucun créneau disponible pour cette date
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          /* Mode affichage */
                          <>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl">
                                {isPast ? '✓' : '🔧'}
                              </span>
                              <h3 className="text-lg font-semibold text-gray-900">
                                Changement de pneus - {appointment.carBrand}
                              </h3>
                              {isPast && (
                                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                                  Terminé
                                </span>
                              )}
                            </div>
                            
                            <div className="space-y-1 text-sm text-gray-700">
                              <p className="flex items-center gap-2">
                                <span className="font-medium">📅 Date:</span>
                                {format(appointmentDate, 'EEEE d MMMM yyyy', { locale: fr })}
                              </p>
                              <p className="flex items-center gap-2">
                                <span className="font-medium">🕐 Heure:</span>
                                {appointment.timeSlot}
                              </p>
                              <p className="flex items-center gap-2">
                                <span className="font-medium">🚗 Véhicule:</span>
                                {appointment.carBrand}
                              </p>
                              <p className="text-xs text-gray-500 mt-2">
                                Réservé le {format(parseISO(appointment.createdAt), 'dd/MM/yyyy à HH:mm')}
                              </p>
                            </div>
                          </>
                        )}
                      </div>

                      {!isPast && (
                        <div className="flex gap-2">
                          {editingId === appointment.id ? (
                            <>
                              <button
                                onClick={handleSaveEdit}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
                              >
                                Enregistrer
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors font-medium"
                              >
                                Annuler
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEditAppointment(appointment)}
                                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors font-medium"
                              >
                                Modifier
                              </button>
                              <button
                                onClick={() => handleCancelAppointment(appointment.id)}
                                className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors font-medium"
                              >
                                Annuler
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
