import * as yup from "yup";

const passwordRules = /^(?=.*\d)(?=.*[a-z]).{5,}$/;
// min 5 characters, 1 upper case letter, 1 lower case letter, 1 numeric digit.

export const basicSchema = yup.object().shape({
  email: yup.string().email("Please enter a valid email").required("Required"),
  age: yup.number().positive().integer().required("Required"),
  password: yup
    .string()
    .min(5)
    .matches(passwordRules, { message: "Please create a stronger password" })
    .required("Required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match")
    .required("Required"),
});

export const loginSchema = yup.object().shape({

  username: yup
    .string()
    .min(3, "first name must be at least 3 characters long")
    .required("Required"),
  password: yup
    .string()
    .min(5)
    .matches(passwordRules, { message: "Please create a stronger password" })
    .required("Required"),
    
});


export const registerSchema = yup.object().shape({

  username: yup
    .string()
    .min(3, "first name must be at least 3 characters long")
    .required("Required"),

  email: yup.string().email("Please enter a valid email").required("Required"),

  password1: yup
    .string()
    .min(5)
    .matches(passwordRules, { message: "Please create a stronger password" })
    .required("Required"),

  password2: yup
    .string()
    .oneOf([yup.ref("password1"), null], "Passwords must match")
    .required("Required"),
});



export const profileSchema = yup.object().shape({

  first_name: yup
    .string()
    .min(3, "first name must be at least 3 characters long")
    .required("Required"),

  last_name: yup
    .string()
    .min(3, "last name must be at least 3 characters long")
    .required("Required"),

  email: yup.string().email("Please enter a valid email").required("Required"),

});



export const passwordSchema = yup.object().shape({

  old_password: yup
  .string()
  .required("Required"),

  new_password1: yup
    .string()
    .min(5)
    .matches(passwordRules, { message: "Please create a stronger password" })
    .required("Required"),

  new_password2: yup
    .string()
    .oneOf([yup.ref("new_password1"), null], "Passwords must match")
    .required("Required"),

});
