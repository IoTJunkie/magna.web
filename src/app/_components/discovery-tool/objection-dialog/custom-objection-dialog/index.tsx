import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Field,
  Input,
  Spinner,
  Textarea,
} from '@fluentui/react-components';
import { IObjection } from '@/app/types/interrogative';

interface ObjectionDialogProps {
  isFormOpen: boolean;
  title: string;
  description: string;
  setTitle: (value: string) => void;
  setDescription: (value: string) => void;
  handleAdd: () => void;
  handleEdit: (objection: IObjection) => void;
  handleClose: () => void;
  isEditMode: boolean;
  idObjection: string;
  isLoading: boolean;
}

const CustomObjectionDialog: React.FC<ObjectionDialogProps> = ({
  isFormOpen,
  title,
  description,
  setTitle,
  setDescription,
  handleAdd,
  handleEdit,
  handleClose,
  isEditMode,
  idObjection,
  isLoading,
}) => {
  const [titleError, setTitleError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');

  const handleSubmit = () => {
    let hasError = false;
    if (!title) {
      setTitleError('The Objection Title is required.');
      hasError = true;
    } else {
      setTitleError('');
    }

    if (!description) {
      setDescriptionError('Opps! Looks like you missed something here.');
      hasError = true;
    } else {
      setDescriptionError('');
    }

    if (!hasError) {
      if (isEditMode) {
        handleEdit({ id: idObjection, name: title, description });
      } else {
        handleAdd();
      }
    }
  };

  const handleCancel = () => {
    setTitleError('');
    setDescriptionError('');
    handleClose();
  };
  return (
    <Dialog open={isFormOpen} modalType='alert'>
      <DialogSurface className='size-[50%] md:!min-w-[30rem]'>
        <DialogBody>
          <DialogTitle className='!text-lg !font-semibold'>
            {isEditMode ? 'Edit Objection' : 'Add Objection'}
          </DialogTitle>
          <DialogContent className='!text-support'>
            <h3>{isEditMode ? 'Edit the Objection' : 'Add the custom objection'}</h3>
            <form>
              <div className='mt-[0.9375rem] flex flex-col gap-[0.9375rem]'>
                <div className='flex flex-col gap-2'>
                  <Field
                    label={
                      <span className='font-semibold'>
                        Objection Title <span className='text-red-500'>*</span>
                      </span>
                    }
                  >
                    <Input
                      id='title'
                      type='text'
                      placeholder='Enter title'
                      maxLength={255}
                      required
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        if (titleError) setTitleError('');
                      }}
                      className={`h-fit w-full resize-none rounded-[0.25rem] border bg-neutrual-900-2 py-[0.5625rem] ${
                        titleError
                          ? '!border-red-500'
                          : 'border-b-aero-13 transition ease-in-out focus-visible:outline-none'
                      }`}
                    />
                    {titleError && <span className='mt-2 text-xs text-red-500'>{titleError}</span>}
                  </Field>
                </div>
                <div className='flex flex-col gap-2'>
                  <Field
                    label={
                      <span className='font-semibold'>
                        Objection Description <span className='text-red-500'>*</span>
                      </span>
                    }
                  >
                    <Textarea
                      id='description'
                      placeholder='Enter description'
                      required
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        if (descriptionError) setDescriptionError('');
                      }}
                      className={`h-[10rem] w-full resize-none rounded-[0.25rem] border bg-neutrual-900-2 py-[0.5625rem] transition ease-in-out focus-visible:outline-none ${
                        descriptionError ? '!border-red-500' : 'border-b-aero-13'
                      } `}
                    />
                    {descriptionError && (
                      <span className='mt-2 text-xs text-red-500'>{descriptionError}</span>
                    )}
                  </Field>
                </div>
              </div>
            </form>
          </DialogContent>
          <DialogActions className='mt-4'>
            <Button
              className='!border-aero-10 !text-base !font-semibold'
              size='large'
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              className='!bg-aero-7 !text-base !font-semibold !text-confirm'
              size='large'
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading && <Spinner size='tiny' className='mr-1' />} Submit
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default CustomObjectionDialog;
