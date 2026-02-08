/**
 * Federation Directory
 * 
 * Browse and search federated organizations
 * Shows trust scores, verification levels, and capabilities
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Organization } from '@/app/federation/types';

export default function FederationDirectory() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCountry, setFilterCountry] = useState<string>('all');

  useEffect(() => {
    loadOrganizations();
  }, [filterType, filterCountry]);

  const loadOrganizations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType !== 'all') params.append('type', filterType);
      if (filterCountry !== 'all') params.append('country', filterCountry);

      const response = await fetch(`/api/federation/org/list?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setOrganizations(data.organizations);
      }
    } catch (error) {
      console.error('Failed to load organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrganizations = organizations.filter(org => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      org.name.toLowerCase().includes(query) ||
      org.country.toLowerCase().includes(query) ||
      org.metadata.description.toLowerCase().includes(query)
    );
  });

  const getTrustColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getVerificationBadge = (level: string) => {
    const badges = {
      certified: 'bg-purple-100 text-purple-800',
      premium: 'bg-blue-100 text-blue-800',
      standard: 'bg-green-100 text-green-800',
      basic: 'bg-gray-100 text-gray-800',
    };
    return badges[level as keyof typeof badges] || badges.basic;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Federation Directory
          </h1>
          <p className="text-gray-600">
            Browse verified organizations in the global mushroom cultivation federation
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search organizations..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="grower">Growers</option>
                <option value="research">Research</option>
                <option value="supplier">Suppliers</option>
                <option value="government">Government</option>
                <option value="cooperative">Cooperatives</option>
              </select>
            </div>

            {/* Country Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <select
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Countries</option>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="GB">United Kingdom</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
              </select>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-3xl font-bold text-blue-600">
              {filteredOrganizations.length}
            </div>
            <div className="text-sm text-gray-600">Organizations</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-3xl font-bold text-green-600">
              {filteredOrganizations.filter(o => o.verificationStatus === 'verified').length}
            </div>
            <div className="text-sm text-gray-600">Verified</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-3xl font-bold text-purple-600">
              {new Set(filteredOrganizations.map(o => o.country)).size}
            </div>
            <div className="text-sm text-gray-600">Countries</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-3xl font-bold text-yellow-600">
              {Math.round(
                filteredOrganizations.reduce((sum, o) => sum + o.trustScore, 0) / 
                (filteredOrganizations.length || 1)
              )}
            </div>
            <div className="text-sm text-gray-600">Avg Trust Score</div>
          </div>
        </div>

        {/* Organization List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading organizations...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrganizations.map((org) => (
              <div
                key={org.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {org.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {org.type.charAt(0).toUpperCase() + org.type.slice(1)}
                    </p>
                  </div>
                  <div className="ml-4">
                    {org.verificationStatus === 'verified' && (
                      <svg
                        className="w-6 h-6 text-green-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {org.metadata.description}
                </p>

                {/* Trust Score */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">Trust Score</span>
                  <span className={`text-2xl font-bold ${getTrustColor(org.trustScore)}`}>
                    {org.trustScore}
                  </span>
                </div>

                {/* Verification Badge */}
                <div className="mb-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getVerificationBadge(
                      org.verificationLevel
                    )}`}
                  >
                    {org.verificationLevel.charAt(0).toUpperCase() + org.verificationLevel.slice(1)} Verified
                  </span>
                </div>

                {/* Location */}
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {org.region}, {org.country}
                </div>

                {/* Certifications */}
                {org.metadata.certifications.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {org.metadata.certifications.slice(0, 3).map((cert, idx) => (
                      <span
                        key={idx}
                        className="inline-block px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                      >
                        {cert}
                      </span>
                    ))}
                    {org.metadata.certifications.length > 3 && (
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        +{org.metadata.certifications.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* View Details Button */}
                <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}

        {filteredOrganizations.length === 0 && !loading && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No organizations found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
