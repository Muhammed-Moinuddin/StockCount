import {Form, Formik} from 'formik';
import { newAdminStoreSchema } from '../validations/newAdminStoreSchema';
import FormInput from '../../src/components/FormInput';
import { signupWithNewStore } from '../services/authApi';
import { useState } from 'react';

const initialValues = {
    
}