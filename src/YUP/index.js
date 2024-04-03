import * as yup from 'yup';

export const SignInSchema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().min(6).max(40).required(),
});

export const SignUpSchema = yup.object().shape({
  username: yup.string().min(3).max(20).required(),
  email: yup.string().email().required(),
  password: yup.string().min(6).max(40).required(),
  password2: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Repeat password is required'),
  checkbox: yup.bool().oneOf([true], 'You must accept the terms and conditions'),
});

export const CreateArticleSchema = yup.object().shape({
  title: yup.string(),
  description: yup.string(),
  body: yup.string(),

  tags: yup.string(),
});

export const EditProfileSchema = yup.object().shape({
  username: yup.string().min(3).max(20).required(),
  email: yup.string().email().required(),

  image: yup.string().required(),
});
