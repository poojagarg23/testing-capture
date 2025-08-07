import React, { useState } from 'react';
import { submitFeedback } from '../../helpers/suggestions-and-feedback/index.js';
import { toast } from 'react-toastify';
import PageHeader from './custom/PageHeader.js';
import Button from './custom/Button.js';
import Textarea from './custom/Textarea.js';
import SuggestionsDropdown from './SuggestionsDropdown.js';
import FileUploadArea from './FileUploadArea.js';
import FileAttachment from './FileAttachment.js';
import { TOAST_CONFIG } from '../../constants/index.js';

const SuggestionsAndFeedback = () => {
  const [feedback, setFeedback] = useState<string>('');
  const [image, setImage] = useState<File | null>(null);
  const [category, setCategory] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('feedback', feedback);
    formData.append('category', category);
    if (image) {
      formData.append('image', image);
    }

    try {
      const { success, data } = await submitFeedback(formData);

      if (success) {
        toast.success(data.message, TOAST_CONFIG.SUCCESS);
        setFeedback('');
        setImage(null);
        setCategory('');
      } else {
        toast.error(data.message, TOAST_CONFIG.ERROR);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Network error occurred', TOAST_CONFIG.ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (file: File) => {
    if (
      image &&
      image.name === file.name &&
      image.size === file.size &&
      image.lastModified === file.lastModified
    ) {
      toast.error(
        `${file.name} has already been selected. Please choose a different file.`,
        TOAST_CONFIG.ERROR,
      );
      return;
    }
    setImage(file);
  };

  const handleRemoveFile = () => {
    setImage(null);
  };

  return (
    <div className="w-full h-full bg-white rounded-2xl shadow-lg px-4 sm:px-6  py-2 md:py-6 flex flex-col">
      <PageHeader title="Suggestions and Feedback" showBackButton={true} />

      <div className="flex flex-col overflow-y-auto gap-6 lg:gap-4 p-4 max-w-4xl xl:max-w-3xl 2xl:max-w-6xl w-full ">
        <SuggestionsDropdown value={category} onChange={setCategory} />

        <div className="flex flex-col gap-3 lg:gap-4">
          <Textarea
            label="Description"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Describe your suggestion, feature request, or report a bug..."
            variant="large"
            className="h-[150px] lg:h-[180px]"
          />
        </div>

        <FileUploadArea
          onFileSelect={handleFileSelect}
          dragActive={dragActive}
          onDragStateChange={setDragActive}
        />

        {image && <FileAttachment file={image} onRemove={handleRemoveFile} />}

        {/* Submit Button */}
        <div className="flex justify-start">
          <Button
            loadingText="Submitting..."
            children="Submit Feedback"
            variant="primary"
            loading={loading}
            onClick={handleSubmit}
            disabled={loading || !feedback.trim() || !category}
            className="px-6 lg:px-8 2xl:px-12 !py-4 lg:!py-4 2xl:!py-6 min-w-[185px] lg:min-w-[200px] 2xl:min-w-[240px] text-sm lg:text-base 2xl:text-xl"
          />
        </div>
      </div>
    </div>
  );
};

export default SuggestionsAndFeedback;
