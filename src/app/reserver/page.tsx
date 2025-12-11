'use client';

import { useState, useEffect } from 'react';
import { format, addDays, addWeeks, subWeeks } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { AvailabilityResponse, AppointmentFormData } from '@/types';
import { useRouter } from 'next/navigation';

export default function ReserverPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [weekOffset, setWeekOffset] = useState(0);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [formData, setFormData] = useState<AppointmentFormData>({
    clientName: '',
    email: '',
    carBrand: '',
    date: '',
    timeSlot: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Vérifier si l'utilisateur est connecté
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        // Pré-remplir le formulaire avec les infos de l'utilisateur
        setFormData(prev => ({
          ...prev,
          clientName: data.user.name,
          email: data.user.email,
        }));
        setCheckingAuth(false);
      } else {
        // Pas connecté, rediriger vers login
        router.push('/login');
      }
    } catch (error) {
      // Pas connecté, rediriger vers login
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

  // Générer 14 jours à partir de la date de base + offset de semaine
  const baseDate = addWeeks(new Date(), weekOffset);
  const next14Days = Array.from({ length: 14 }, (_, i) => addDays(baseDate, i));

  // Charger les créneaux disponibles quand la date change
  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(format(selectedDate, 'yyyy-MM-dd'));
    }
  }, [selectedDate]);

  const fetchAvailableSlots = async (date: string) => {
    try {
      const response = await fetch(`/api/availability?date=${date}`);
      const data: AvailabilityResponse = await response.json();
      setAvailableSlots(data.slots || []);
      setSelectedSlot('');
    } catch (error) {
      console.error('Erreur lors de la récupération des créneaux:', error);
      setAvailableSlots([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSlot) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner un créneau horaire' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          date: format(selectedDate, 'yyyy-MM-dd'),
          timeSlot: selectedSlot,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: 'Rendez-vous confirmé! Vous recevrez un courriel de confirmation.' 
        });
        
        // Réinitialiser uniquement le champ marque de voiture
        setFormData(prev => ({ 
          ...prev,
          carBrand: '', 
          date: '', 
          timeSlot: '' 
        }));
        setSelectedSlot('');
        // Rafraîchir les créneaux disponibles
        fetchAvailableSlots(format(selectedDate, 'yyyy-MM-dd'));
      } else {
        setMessage({ type: 'error', text: data.error || 'Une erreur est survenue' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion au serveur' });
    } finally {
      setLoading(false);
    }
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                🔧 PneuExpress
              </h1>
              <p className="text-xl text-gray-600 mt-2">
                Réservez votre changement de pneus
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Du lundi au vendredi, de 8h00 à 16h00
              </p>
              {user && (
                <p className="text-sm text-blue-600 mt-2">
                  Connecté en tant que <strong>{user.name}</strong>
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <a
                href="/mes-rendez-vous"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                📅 Mes rendez-vous
              </a>
              {(user?.role === 'admin' || user?.role === 'employee') && (
                <a
                  href="/admin"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  🔧 Admin
                </a>
              )}
              <a
                href="/a-propos"
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium"
              >
                ℹ️ À propos
              </a>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Calendrier */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                Sélectionnez une date
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setWeekOffset(weekOffset - 1)}
                  disabled={weekOffset <= 0}
                  className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  title="Semaine précédente"
                >
                  ←
                </button>
                <button
                  onClick={() => setWeekOffset(weekOffset + 1)}
                  disabled={weekOffset >= 4}
                  className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  title="Semaine suivante"
                >
                  →
                </button>
              </div>
            </div>
            
            {/* Indicateur de période */}
            <div className="mb-4 text-center">
              <p className="text-sm text-gray-600">
                {format(next14Days[0], 'dd MMM', { locale: fr })} - {format(next14Days[13], 'dd MMM yyyy', { locale: fr })}
              </p>
              {weekOffset !== 0 && (
                <button
                  onClick={() => setWeekOffset(0)}
                  className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                >
                  Revenir à aujourd'hui
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {next14Days.map((date) => {
                const isDisabled = isWeekend(date);
                const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                
                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => !isDisabled && setSelectedDate(date)}
                    disabled={isDisabled}
                    className={`p-3 rounded-lg text-center transition-all ${
                      isDisabled
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : isSelected
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                  >
                    <div className="text-xs font-medium">
                      {format(date, 'EEE', { locale: fr })}
                    </div>
                    <div className="text-lg font-bold">
                      {format(date, 'd')}
                    </div>
                    <div className="text-xs">
                      {format(date, 'MMM', { locale: fr })}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Créneaux horaires */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Créneaux disponibles
              </h3>
              {availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-2 rounded-md text-sm font-medium transition-all ${
                        selectedSlot === slot
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-800'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm italic">
                  {isWeekend(selectedDate)
                    ? 'Fermé le weekend'
                    : 'Aucun créneau disponible pour cette date'}
                </p>
              )}
            </div>
          </div>

          {/* Formulaire */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Vos informations
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet *
                </label>
                <input
                  type="text"
                  required
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="Jean Dupont"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="jean.dupont@example.com"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="Toyota Camry"
                />
              </div>

              {/* Résumé de la sélection */}
              {selectedSlot && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Résumé de votre rendez-vous</h4>
                  <p className="text-sm text-blue-800">
                    📅 {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
                  </p>
                  <p className="text-sm text-blue-800">
                    🕐 {selectedSlot}
                  </p>
                </div>
              )}

              {/* Messages */}
              {message && (
                <div
                  className={`p-4 rounded-md ${
                    message.type === 'success'
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !selectedSlot}
                className={`w-full py-3 px-4 rounded-md font-medium transition-all ${
                  loading || !selectedSlot
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                }`}
              >
                {loading ? 'Réservation en cours...' : 'Confirmer la réservation'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
