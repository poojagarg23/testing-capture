import React, { useState, useEffect } from 'react';
import { getAllUsersWithPics } from '../../helpers/directory/index.js';

import { UserData } from '../../types/index.ts';
import PageHeader from '../reusable/custom/PageHeader.tsx';
import DirectoryUserCard from './DirectoryUserCard.tsx';
import SearchBar from '../reusable/custom/SearchBar.tsx';
import SearchIcon from '../../assets/icons/search.svg?react';

const Directory: React.FC = () => {
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);

  const handleGetAllUsers = async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await getAllUsersWithPics();
      if (data && data.users) {
        setAllUsers(data.users);
        setFilteredUsers(data.users);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (allUsers.length === 0) {
      handleGetAllUsers();
    }
  }, [allUsers.length]);

  const handleSearch = (val: string): void => {
    const searchTerm = val.toLowerCase();
    setSearchQuery(searchTerm);

    if (!searchTerm) {
      setFilteredUsers(allUsers);
      return;
    }

    const filtered = allUsers.filter((user) => {
      const fullName = `${user.firstname} ${user.lastname}`.toLowerCase();
      const email = user.email.toLowerCase();
      const title = user.title.toLowerCase();

      return (
        fullName.includes(searchTerm) || email.includes(searchTerm) || title.includes(searchTerm)
      );
    });

    setFilteredUsers(filtered);
  };

  const ShimmerCard: React.FC = () => (
    <div className="bg-white rounded-2xl figma-card-shadow w-full h-full flex flex-col">
      {/* Header Section */}
      <div className="w-full">
        <div className="flex flex-row items-center w-full">
          <div className="flex flex-row gap-2.5 items-center px-4 py-5 w-full">
            <div className={`shimmer w-10 h-10 rounded-full shrink-0`} />
            <div className="flex flex-col gap-[3px] items-start w-full min-w-0">
              <div className={`shimmer w-32 h-5 mb-1`} />
              <div className={`shimmer w-24 h-4`} />
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-[rgba(43,53,61,0.1)]" />

      {/* Details Section */}
      <div className="w-full flex-1">
        <div className="p-4 w-full h-full">
          <div className="flex flex-col gap-4 items-start w-full h-full">
            <div className="flex flex-col gap-1 items-start w-full">
              <div className={`shimmer w-16 h-3 mb-1`} />
              <div className={`shimmer w-20 h-4`} />
            </div>
            <div className="flex flex-col gap-1 items-start w-full">
              <div className={`shimmer w-20 h-3 mb-1`} />
              <div className={`shimmer w-24 h-4`} />
            </div>
            <div className="flex flex-col gap-1 items-start w-full">
              <div className={`shimmer w-14 h-3 mb-1`} />
              <div className={`shimmer w-32 h-4`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  return (
    <div className="w-full h-full bg-white rounded-2xl shadow-lg px-4 sm:px-6  py-2 md:py-6 flex flex-col">
      <PageHeader title="Directory" showBackButton={true} />

      <div className="mb-6">
        <SearchBar
          placeholder="Search Directory"
          icon={<SearchIcon className="w-5 h-5 opacity-30" />}
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      <div className="flex-1 overflow-y-auto pb-12 2xl:pb-16">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array(8)
              .fill(null)
              .map((_, index) => (
                <ShimmerCard key={index} />
              ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
            <p className="text-secondary text-lg font-gotham-medium">No users found</p>
            {searchQuery && (
              <p className="text-secondary opacity-60 text-sm font-gotham-normal mt-2">
                Try adjusting your search criteria
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {filteredUsers.map((user) => (
              <DirectoryUserCard key={user.id} user={user} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Directory;
