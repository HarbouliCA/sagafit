'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, Firestore } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Session } from '@/types';

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      if (!firestore) return;
      
      try {
        const sessionsQuery = query(
          collection(firestore as Firestore, 'sessions'),
          orderBy('startTime', 'desc')
        );
        
        const snapshot = await getDocs(sessionsQuery);
        const fetchedSessions = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          startTime: doc.data().startTime?.toDate(),
          endTime: doc.data().endTime?.toDate()
        } as Session));
        
        setSessions(fetchedSessions);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Training Sessions</h1>
        <Link 
          href="/dashboard/sessions/create" 
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          Add Session
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No sessions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sessions.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{session.userName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{session.activityName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {session.startTime.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {session.duration} min
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        session.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : session.status === 'in-progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {session.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/dashboard/sessions/${session.id}`}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        View
                      </Link>
                      <Link
                        href={`/dashboard/sessions/${session.id}/edit`}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
