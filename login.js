"use strict";

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
    } else {
      console.log("Logged in!");
      window.location.href = "index.html";
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