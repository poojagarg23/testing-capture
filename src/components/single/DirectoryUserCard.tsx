import React from 'react';
import UsersIcon from '../../assets/icons/user.svg?react';

import { UserData } from '../../types/index';

interface DirectoryUserCardProps {
  user: UserData;
  className?: string;
}

/**
 * DirectoryUserCard component based on Figma design
 *
 * Features:
 * - Card layout with avatar, name, and company
 * - Divider line between header and details
 * - Three detail sections: Position, Contact No., Email ID
 * - Responsive design with proper spacing
 * - Uses reusable CSS classes from index.css
 *
 * @example
 * <DirectoryUserCard
 *   user={{
 *     id: 1,
 *     firstname: 'John',
 *     lastname: 'Doe',
 *     email: 'john.doe@example.com',
 *     phone: '1234567890',
 *     title: 'Physician',
 *     division: 'Clinical',
 *     company_name: 'Virginia Rehab Physicians',
 *     profile_pic_url: 'https://example.com/avatar.jpg'
 *   }}
 * />
 */
const DirectoryUserCard: React.FC<DirectoryUserCardProps> = ({ user, className = '' }) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-input shadow-[0px_16px_32px_-8px_rgba(0,0,0,0.10)] hover:shadow-[0px_16px_32px_-8px_rgba(0,0,0,0.20)] cursor-pointer transition-shadow duration-300 w-full h-full flex flex-col ${className}`}
    >
      <div className="w-full">
        <div className="flex flex-row items-center w-full">
          <div className="flex flex-row gap-2.5 items-start px-4 py-5 w-full">
            <div className="relative shrink-0">
              <div className="relative inline-grid grid-cols-[max-content] grid-rows-[max-content] place-items-start leading-[0]">
                {/* Main Avatar Circle */}
                <div className="[grid-area:1_/_1] w-12 h-12 aspect-[1/1] bg-[var(--directory-card)] rounded-full ml-0 mt-0"></div>

                {/* User Icon Overlay */}
                <div className="[grid-area:1_/_1] ml-2.5 mt-2.5 w-7 h-7 aspect-[1/1] overflow-hidden relative">
                  <div className="absolute bottom-[8.333%] left-[16.667%] right-[16.667%] top-[4.167%]">
                    <UsersIcon className="block max-w-none w-full h-full text-primary" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-[10px] items-start justify-center w-full min-w-0">
              <h3 className="font-gotham-bold text-sm sm:text-base md:text-base lg:text-base xl:text-base 2xl:text-xl text-secondary leading-tight m-0 truncate w-full">
                {`${user.firstname} ${user.lastname}`}
              </h3>
              <p className="font-gotham-normal text-xs sm:text-xs md:text-sm lg:text-sm xl:text-xs 2xl:text-base text-error leading-4 m-0 truncate w-full">
                {user.company_name || 'No Company'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="h-px w-full border-subtle" />

      <div className="w-full flex-1">
        <div className="px-4 py-5 2xl:py-9 w-full h-full">
          <div className="flex flex-col gap-4 items-start w-full h-full">
            <div className="flex flex-col gap-1 items-start w-full">
              <div className="font-gotham-normal text-xs sm:text-xs md:text-xs lg:text-xs xl:text-xs 2xl:text-base text-secondary opacity-60 leading-3">
                <p className="m-0">Physician</p>
              </div>
              <div className="font-gotham-medium text-sm sm:text-sm md:text-sm lg:text-sm xl:text-sm 2xl:text-lg text-secondary leading-normal">
                <p className="m-0">{user.title || user.division || 'N/A'}</p>
              </div>
            </div>

            <div className="flex flex-col gap-1 items-start w-full">
              <div className="font-gotham-normal text-xs sm:text-xs md:text-xs lg:text-xs xl:text-xs 2xl:text-base text-secondary opacity-60 leading-3">
                <p className="m-0">Contact No.</p>
              </div>
              <div className="font-gotham-medium text-sm sm:text-sm md:text-sm lg:text-sm xl:text-sm 2xl:text-lg text-secondary leading-normal">
                <p className="m-0">{user.phone || 'N/A'}</p>
              </div>
            </div>

            <div className="flex flex-col gap-1 items-start w-full">
              <div className="font-gotham-normal text-xs sm:text-xs md:text-xs lg:text-xs xl:text-xs 2xl:text-base text-secondary opacity-60 leading-3">
                <p className="m-0">Email ID</p>
              </div>
              <div className="font-gotham-medium text-sm sm:text-sm md:text-sm lg:text-sm xl:text-sm 2xl:text-lg text-secondary leading-normal break-all">
                <p className="m-0">{user.email || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectoryUserCard;
