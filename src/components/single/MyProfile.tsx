import React, { useState, ChangeEvent } from 'react';
import nobodyAvatar from '../../assets/images/nobody-avatar.jpg';
import profileEditPencil from '../../assets/icons/profile-edit-pencil.svg';
import CustomModal from '../reusable/CustomModal';
import Button from '../reusable/custom/Button';
import InputField from '../reusable/custom/InputField';
import Dropdown from '../reusable/custom/Dropdown';
import { COUNTRY_CODE_OPTIONS } from '../../constants/countryCodes';
import { titleToDivision } from '../../helpers/index.js';
import { deleteProfilePic, updateUserDetails } from '../../helpers/my-profile/index.js';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'react-toastify';
import { UserData } from '../../types/index.js';
import { OutletContextType } from '../../types/MyProfile.types';
import { TOAST_CONFIG } from '../../constants/index.js';

type Title = keyof typeof titleToDivision;

const MyProfile: React.FC = () => {
  const { userData, profilePicUrl, getUserDetails } = useOutletContext<OutletContextType>();
  const [openModal, setOpenModal] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [newProfilePic, setNewProfilePic] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [countryCode, setCountryCode] = useState<string>('+1');
  const [formData, setFormData] = useState<Omit<UserData, 'id' | 'profile_pic'>>({
    firstname: '',
    lastname: '',
    title: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    email: '',
    company_name: '',
    division: '',
  });

  const titleOptions = [
    { label: 'Select Title', value: '' },
    { label: 'Physician', value: 'Physician' },
    { label: 'Nurse Practitioner', value: 'Nurse Practitioner' },
    { label: "Physician's Assistant", value: "Physician's Assistant" },
    { label: 'Operations', value: 'Operations' },
    { label: 'IT Admin', value: 'IT Admin' },
    { label: 'Hospital Staff', value: 'Hospital Staff' },
  ];

  const companyOptions = [
    { label: 'Select Company', value: '' },
    { label: 'Virginia Rehab Physicians', value: 'Virginia Rehab Physicians' },
    { label: 'Others', value: 'Others' },
  ];

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i;

    if (file) {
      if (!allowedExtensions.exec(file.name)) {
        toast.error('Invalid image file', TOAST_CONFIG.ERROR);
      } else {
        setNewProfilePic(file);
        setSelectedFileName(file.name);
      }
    }
  };

  const handleTitleChange = (value: string | number | (string | number)[]) => {
    const selectedTitle = value as Title;
    const newDivision = titleToDivision[selectedTitle];

    setFormData((prev) => ({
      ...prev,
      title: selectedTitle,
      division: newDivision,
    }));
  };

  const handleCompanyChange = (value: string | number | (string | number)[]) => {
    setFormData((prev) => ({
      ...prev,
      company_name: value as string,
    }));
  };

  const handleCountryCodeChange = (value: string | number | (string | number)[]) => {
    setCountryCode(value as string);
  };

  const handleOpenModal = (section: string) => {
    const extractedCountryCode = userData?.country_code || '+1';

    setCountryCode(extractedCountryCode);
    setFormData({
      firstname: userData?.firstname || '',
      lastname: userData?.lastname || '',
      title: userData?.title || '',
      phone: userData?.phone || '',
      street: userData?.street || '',
      city: userData?.city || '',
      state: userData?.state || '',
      zipcode: userData?.zipcode || '',
      email: userData?.email || '',
      division: userData?.division || '',
      company_name: userData?.company_name || '',
    });
    setActiveSection(section);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setNewProfilePic(null);
    setSelectedFileName('');
    setLoading(false);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (newProfilePic && userData && userData.profile_pic) {
        const success = await deleteProfilePic(userData.id, userData.profile_pic);
        if (!success) {
          toast.error('Failed to delete existing profile picture', TOAST_CONFIG.ERROR);
          return;
        }
      }

      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, (formData as unknown as Record<string, string>)[key]);
      });
      formDataToSend.append('country_code', countryCode);
      if (newProfilePic) {
        formDataToSend.append('profilePic', newProfilePic);
      }

      const response = await updateUserDetails(formDataToSend);
      if (response?.success) {
        toast.success('Profile updated successfully!', TOAST_CONFIG.SUCCESS);
        handleCloseModal();
        await getUserDetails();
      } else {
        toast.error('Failed to update profile. Please try again.', TOAST_CONFIG.ERROR);
      }
    } catch (error) {
      console.error('Error updating user details:', error);
      toast.error(
        'An error occurred while updating your profile. Please try again.',
        TOAST_CONFIG.ERROR,
      );
    } finally {
      setLoading(false);
    }
  };

  const renderModalContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex flex-col gap-2 mb-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="profile-pic-input"
              />
              <label
                htmlFor="profile-pic-input"
                className="btn-primary px-4 py-2 rounded-full cursor-pointer text-white font-gotham-bold text-sm w-fit"
              >
                Choose Profile Picture
              </label>
              {selectedFileName && (
                <span className="font-gotham text-sm text-muted">{selectedFileName}</span>
              )}
            </div>
            <div className="flex flex-col gap-4">
              <InputField
                label="Last Name"
                value={formData.lastname}
                onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                placeholder="Enter last name"
              />
              <InputField
                label="First Name"
                value={formData.firstname}
                onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                placeholder="Enter first name"
              />

              <div className="flex flex-col gap-2">
                <label className="block text-xs 2xl:text-sm font-gotham-medium text-secondary !mb-2">
                  Title
                </label>
                <Dropdown
                  options={titleOptions}
                  value={formData.title}
                  onChange={handleTitleChange}
                  placeholder="Select Title"
                  fullWidth
                  variant="variant_2"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="block text-xs 2xl:text-sm font-gotham-medium text-secondary !mb-2">
                  Company Name
                </label>
                <Dropdown
                  options={companyOptions}
                  value={formData.company_name}
                  onChange={handleCompanyChange}
                  placeholder="Select Company"
                  fullWidth
                  variant="variant_2"
                />
              </div>
            </div>
            <div className="flex justify-end gap-4 pt-4">
              <Button paddingLevel={3} variant="white" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button paddingLevel={3} variant="primary" onClick={handleSave} loading={loading}>
                Save
              </Button>
            </div>
          </div>
        );
      case 'contact':
        return (
          <div className="space-y-6">
            <div className="flex flex-col gap-4">
              <InputField
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email address"
              />
              {/* Phone number with country code dropdown */}
              <div className="flex flex-col gap-2">
                <label className="block text-xs 2xl:text-sm text-secondary">Phone Number</label>
                <div className="flex gap-2">
                  <div className="w-28 mx-1">
                    <Dropdown
                      options={COUNTRY_CODE_OPTIONS}
                      value={countryCode}
                      onChange={handleCountryCodeChange}
                      fullWidth
                      variant="variant_2"
                    />
                  </div>
                  <InputField
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter phone number"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-4 pt-4">
              <Button paddingLevel={3} variant="white" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button paddingLevel={3} variant="primary" onClick={handleSave} loading={loading}>
                Save
              </Button>
            </div>
          </div>
        );
      case 'address':
        return (
          <div className="space-y-6">
            <div className="flex flex-col gap-4">
              <InputField
                label="Street Address"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                placeholder="Enter street address"
              />
              <InputField
                label="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Enter city"
              />
              <InputField
                label="State"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="Enter state"
              />
              <InputField
                label="Zip Code"
                value={formData.zipcode}
                onChange={(e) => setFormData({ ...formData, zipcode: e.target.value })}
                placeholder="Enter zip code"
              />
            </div>
            <div className="flex justify-end gap-4 pt-4">
              <Button paddingLevel={3} variant="white" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button paddingLevel={3} variant="primary" onClick={handleSave} loading={loading}>
                Save
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const getModalTitle = () => {
    switch (activeSection) {
      case 'profile':
        return 'Edit Profile';
      case 'contact':
        return 'Edit Contact Information';
      case 'address':
        return 'Edit Address';
      default:
        return '';
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-8 max-w-3xl  2xl:max-w-7xl">
          <div className="space-y-8">
            {/* Profile Section */}
            <div className="bg-white rounded-2xl border-input card-shadow-lg p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden flex-shrink-0">
                    <img
                      src={profilePicUrl || nobodyAvatar}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-gotham-bold text-base 2xl:text-xl text-secondary mb-1">
                      {userData ? `${userData.firstname} ${userData.lastname}` : 'Loading...'}
                    </h3>
                    <p className="font-gotham text-sm text-secondary mb-1">{userData?.title}</p>
                    <p className="font-gotham text-sm text-muted">{userData?.company_name}</p>
                  </div>
                </div>
                {userData && (
                  <div className="flex-shrink-0">
                    <button
                      className="flex items-center gap-2 text-primary font-gotham-medium text-sm hover:opacity-75 transition-opacity cursor-pointer"
                      onClick={() => handleOpenModal('profile')}
                    >
                      <img src={profileEditPencil} alt="Edit" className="w-6 h-6" />
                      Edit
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="bg-white rounded-2xl border-input card-shadow-lg p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
                <div className="flex-1">
                  <h3 className="font-gotham-bold text-base 2xl:text-xl text-secondary mb-1">
                    Contact Information
                  </h3>
                </div>
                {userData && (
                  <div className="flex-shrink-0">
                    <button
                      className="flex items-center gap-2 text-primary font-gotham-medium text-sm hover:opacity-75 transition-opacity cursor-pointer"
                      onClick={() => handleOpenModal('contact')}
                    >
                      <img src={profileEditPencil} alt="Edit" className="w-6 h-6" />
                      Edit
                    </button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-gotham text-sm text-muted mb-2">Email Address</label>
                  <div className="font-gotham-medium text-base text-secondary break-all">
                    {userData?.email && userData.email !== 'null' ? userData.email : ''}
                  </div>
                </div>
                <div>
                  <label className="block font-gotham text-sm text-muted mb-2">Phone Number</label>
                  <div className="font-gotham-medium text-base text-secondary">
                    {userData?.phone && userData.phone !== 'null'
                      ? `${userData?.country_code || ''} ${userData.phone}`
                      : ''}
                  </div>
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div className="bg-white rounded-2xl border-input card-shadow-lg p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
                <div className="flex-1">
                  <h3 className="font-gotham-bold text-base  2xl:text-xl text-secondary mb-1">
                    Address
                  </h3>
                </div>
                {userData && (
                  <div className="flex-shrink-0">
                    <button
                      className="flex items-center gap-2 text-primary font-gotham-medium text-sm hover:opacity-75 transition-opacity cursor-pointer"
                      onClick={() => handleOpenModal('address')}
                    >
                      <img src={profileEditPencil} alt="Edit" className="w-6 h-6" />
                      Edit
                    </button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-gotham text-sm text-muted mb-2">
                    Street Address
                  </label>
                  <div className="font-gotham-medium text-base text-secondary">
                    {userData?.street && userData.street !== 'null' ? userData.street : ''}
                  </div>
                </div>
                <div>
                  <label className="block font-gotham text-sm text-muted mb-2">City</label>
                  <div className="font-gotham-medium text-base text-secondary">
                    {userData?.city && userData.city !== 'null' ? userData.city : ''}
                  </div>
                </div>
                <div>
                  <label className="block font-gotham text-sm text-muted mb-2">State</label>
                  <div className="font-gotham-medium text-base text-secondary">
                    {userData?.state && userData.state !== 'null' ? userData.state : ''}
                  </div>
                </div>
                <div>
                  <label className="block font-gotham text-sm text-muted mb-2">Zip Code</label>
                  <div className="font-gotham-medium text-base text-secondary">
                    {userData?.zipcode && userData.zipcode !== 'null' ? userData.zipcode : ''}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CustomModal
        isOpen={openModal}
        onClose={handleCloseModal}
        title={getModalTitle()}
        useFixedWidth={true}
      >
        {renderModalContent()}
      </CustomModal>
    </div>
  );
};

export default MyProfile;
