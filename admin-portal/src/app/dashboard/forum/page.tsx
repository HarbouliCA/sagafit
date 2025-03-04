'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, Firestore } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';
import { ForumThread } from '@/types';

export default function ForumPage() {
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchThreads = async () => {
      if (!firestore) return;
      
      try {
        const threadsQuery = query(
          collection(firestore as Firestore, 'forum_threads'),
          orderBy('lastActivity', 'desc')
        );
        
        const snapshot = await getDocs(threadsQuery);
        const fetchedThreads = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          lastActivity: doc.data().lastActivity?.toDate()
        } as ForumThread));
        
        setThreads(fetchedThreads);
      } catch (error) {
        console.error('Error fetching forum threads:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchThreads();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Forum</h1>
        <Link 
          href="/dashboard/forum/create" 
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          New Thread
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : threads.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No forum threads found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Replies</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {threads.map((thread) => (
                  <tr key={thread.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{thread.title}</div>
                      <div className="text-sm text-gray-500 line-clamp-1">{thread.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {thread.authorPhotoURL ? (
                          <img className="h-8 w-8 rounded-full mr-3" src={thread.authorPhotoURL} alt="" />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-200 mr-3 flex items-center justify-center">
                            <span className="text-gray-500 text-sm">{thread.authorName?.[0]?.toUpperCase()}</span>
                          </div>
                        )}
                        <div className="text-sm text-gray-900">{thread.authorName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {thread.replyCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {thread.lastActivity.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/dashboard/forum/${thread.id}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        View
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
