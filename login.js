"use strict";

let errorTextVisible = false;

let loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmailInput").value;
    const password = document.getElementById("loginPasswordInput").value;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.log("Login failed: " + error.message);
      document.getElementById("errorDiv").classList.remove("hidden");
      errorTextVisible = true;
    } else {
      window.location.href = "index.html";
    }
});

let signUpForm = document.getElementById("signUpForm");

signUpForm.addEventListener("submit", async(e) => {
  e.preventDefault();
  const email = document.getElementById("signupEmailInput").value;
  const name = document.getElementById("signupNameInput").value;
  const password = document.getElementById("signupPasswordInput").value;

  const {data, error} = await supabase.auth.signUp({
    email,
    options: {
      data: {
        name
      },
    },
    password
  });

  if (error) {
    console.log("Sign up failed: " + error.message);
  } else {
    verifyEmail();
  }
});

function verifyEmail() {
  signUpForm.innerHTML = "";
  document.getElementById("verifyEmailDiv").classList.remove("hidden");
  const verificationInterval = setInterval(async () => {
    const {data} = await supabase.auth.getUser();
    // console.log(data.user.email_confirmed_at);
    if (data.user && data.user.email_confirmed_at !== null) {
      clearInterval(verificationInterval);
      window.location.href = "index.html";
    }
  }, 5000);
}

document.getElementById("loginEmailInput").addEventListener("input", () => {
  if (errorTextVisible) {
    errorTextVisible = false;
    document.getElementById("errorDiv").classList.add("hidden");
  }
});

document.getElementById("loginPasswordInput").addEventListener("input", () => {
  if (errorTextVisible) {
    errorTextVisible = false;
    document.getElementById("errorDiv").classList.add("hidden");
  }
});

function toggleForm(calling) {
  let signUp = document.getElementById("signUpDiv");
  let login = document.getElementById("loginDiv");
  if (calling === 1) {
    toggleFormFields(login, false);
    toggleFormFields(signUp, true);
    login.classList.add("hidden");
    signUp.classList.remove("hidden");
  } else {
    toggleFormFields(signUp, false);
    toggleFormFields(login, true);
    signUp.classList.add("hidden");
    login.classList.remove("hidden");
  }

}

function toggleFormFields(container, enable) {
  const fields = container.querySelectorAll("input, button");
  fields.forEach(function(i) {
      i.disabled = !enable;
  });
}

document.querySelectorAll(".toggleShowPassword").forEach(toggle => {
  toggle.addEventListener("click", () => {
    const wrapper = toggle.closest(".passwordInputWrapper");
    const input = wrapper.querySelector(".passwordInput");
    const isPassword = input.type === "password";
    input.type = isPassword ? "text" : "password";
    toggle.textContent = isPassword ? "HIDE" : "SHOW";
  });
});