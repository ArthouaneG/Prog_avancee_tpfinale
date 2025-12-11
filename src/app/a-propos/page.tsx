'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AboutPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
    } finally {
      setCheckingAuth(false);
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

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                À propos
              </h1>
              <p className="text-gray-600 mt-1">PneuExpress</p>
            </div>
            <div className="flex gap-3">
              {user ? (
                <>
                  <Link
                    href={user.role === 'admin' || user.role === 'employee' ? '/admin' : '/reserver'}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                  >
                    <span>←</span>
                    <span>Accueil</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Connexion
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Informations de l'application */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            🚗 Application PneuExpress
          </h2>
          <p className="text-gray-700 mb-4">
            Système de gestion de rendez-vous pour le changement de pneus. Cette application permet aux clients de réserver des créneaux horaires et aux employés de gérer l'ensemble des rendez-vous.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 font-semibold mb-2">Version de l'application</p>
            <p className="text-2xl font-bold text-blue-600">v1.0.0</p>
          </div>
        </div>

        {/* Versions des technologies */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            💻 Technologies utilisées
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Framework principal */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="text-xl">⚛️</span> Framework
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Next.js</span>
                  <span className="font-mono text-sm bg-white px-2 py-1 rounded">16.0.7</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">React</span>
                  <span className="font-mono text-sm bg-white px-2 py-1 rounded">19.2.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">React DOM</span>
                  <span className="font-mono text-sm bg-white px-2 py-1 rounded">19.2.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">TypeScript</span>
                  <span className="font-mono text-sm bg-white px-2 py-1 rounded">5.x</span>
                </div>
              </div>
            </div>

            {/* Base de données */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="text-xl">🗄️</span> Base de données
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Prisma ORM</span>
                  <span className="font-mono text-sm bg-white px-2 py-1 rounded">5.22.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">SQLite</span>
                  <span className="font-mono text-sm bg-white px-2 py-1 rounded">3.x</span>
                </div>
              </div>
            </div>

            {/* Authentification */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="text-xl">🔐</span> Authentification
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Jose (JWT)</span>
                  <span className="font-mono text-sm bg-white px-2 py-1 rounded">6.1.3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">bcryptjs</span>
                  <span className="font-mono text-sm bg-white px-2 py-1 rounded">3.0.3</span>
                </div>
              </div>
            </div>

            {/* Utilitaires */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="text-xl">🛠️</span> Utilitaires
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">date-fns</span>
                  <span className="font-mono text-sm bg-white px-2 py-1 rounded">4.1.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nodemailer</span>
                  <span className="font-mono text-sm bg-white px-2 py-1 rounded">7.0.11</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tailwind CSS</span>
                  <span className="font-mono text-sm bg-white px-2 py-1 rounded">4.x</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Informations du développeur */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            👨‍💻 Développeur
          </h2>
          <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl">👤</span>
                <div>
                  <p className="font-semibold text-gray-800">Nom du développeur</p>
                  <p className="text-gray-600">Arthouane Gillekens</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎓</span>
                <div>
                  <p className="font-semibold text-gray-800">Formation</p>
                  <p className="text-gray-600">Session 5 - Automne 2025</p>
                  <p className="text-gray-600">Programmation avancée - CEGEP</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="text-2xl">📅</span>
                <div>
                  <p className="font-semibold text-gray-800">Date de création</p>
                  <p className="text-gray-600">Décembre 2025</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="text-2xl">📧</span>
                <div>
                  <p className="font-semibold text-gray-800">Contact</p>
                  <p className="text-gray-600">202338916@cegeplapocatiere.qc.ca</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fonctionnalités */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            ✨ Fonctionnalités principales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <span className="text-xl">✅</span>
              <div>
                <p className="font-semibold text-gray-700">Système d'authentification</p>
                <p className="text-sm text-gray-600">JWT avec gestion des rôles (client, admin, employé)</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-xl">📅</span>
              <div>
                <p className="font-semibold text-gray-700">Réservation de rendez-vous</p>
                <p className="text-sm text-gray-600">Interface calendrier avec créneaux disponibles</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-xl">🔧</span>
              <div>
                <p className="font-semibold text-gray-700">Tableau de bord admin</p>
                <p className="text-sm text-gray-600">Gestion complète des rendez-vous et filtres avancés</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-xl">📧</span>
              <div>
                <p className="font-semibold text-gray-700">Notifications email</p>
                <p className="text-sm text-gray-600">Confirmation automatique par courriel</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-xl">✏️</span>
              <div>
                <p className="font-semibold text-gray-700">Modification de rendez-vous</p>
                <p className="text-sm text-gray-600">Les clients peuvent modifier leurs réservations</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-xl">🎨</span>
              <div>
                <p className="font-semibold text-gray-700">Interface moderne</p>
                <p className="text-sm text-gray-600">Design responsive avec Tailwind CSS</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
