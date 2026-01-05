import { auth, db } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const googleProvider = new GoogleAuthProvider();

export async function logoutUser() { return await signOut(auth); }

export function initAuth(onUserLogin, onUserLogout) {
    const form = document.getElementById('auth-form');
    const emailInput = document.getElementById('auth-email');
    const passInput = document.getElementById('auth-password');
    const nameInput = document.getElementById('auth-name'); 
    const errorMsg = document.getElementById('auth-error');
    const btnSubmit = document.getElementById('btn-submit-auth');
    const btnToggle = document.getElementById('btn-toggle-auth');
    const btnGoogle = document.getElementById('btn-google-auth');
    const btnForgot = document.getElementById('btn-forgot-pass');
    const switchText = document.getElementById('auth-switch-text');
    
    let isRegistering = false;

    // --- RECUPERAR CONTRASEÑA ---
    if (btnForgot) {
        btnForgot.onclick = async () => {
            const email = emailInput.value.trim();
            if (!email) {
                errorMsg.textContent = "Introduce tu email primero.";
                errorMsg.style.color = "yellow";
                return;
            }
            try {
                await sendPasswordResetEmail(auth, email);
                errorMsg.textContent = "Email de recuperación enviado.";
                errorMsg.style.color = "lightgreen";
            } catch (e) { 
                errorMsg.textContent = "Error al enviar el email."; 
                errorMsg.style.color = "red";
            }
        };
    }

    // --- ACCESO CON GOOGLE ---
    if (btnGoogle) {
        btnGoogle.onclick = async () => {
            try {
                const result = await signInWithPopup(auth, googleProvider);
                const user = result.user;
                const userDocName = user.displayName || user.email.split('@')[0];
                await setDoc(doc(db, "usuarios", userDocName), {
                    uid: user.uid, 
                    email: user.email, 
                    nombre: userDocName, 
                    fechaRegistro: new Date()
                }, { merge: true });
            } catch (e) { 
                errorMsg.textContent = "Error al conectar con Google."; 
                errorMsg.style.color = "red";
            }
        };
    }

    // --- CAMBIO ENTRE LOGIN Y REGISTRO ---
    if (btnToggle) {
        btnToggle.onclick = (e) => {
            e.preventDefault();
            isRegistering = !isRegistering;
            btnSubmit.textContent = isRegistering ? "CREAR CUENTA" : "ENTRAR";
            switchText.textContent = isRegistering ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?";
            btnToggle.textContent = isRegistering ? "Inicia sesión" : "Regístrate";
            nameInput.style.display = isRegistering ? "block" : "none";
            nameInput.required = isRegistering;
            errorMsg.textContent = ""; 
        };
    }

    // --- FORMULARIO DE ACCESO / REGISTRO ---
    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            errorMsg.style.color = "red";
            errorMsg.textContent = "Cargando...";

            const email = emailInput.value.trim();
            const pass = passInput.value;

            // Validación de seguridad mínima
            if (pass.length < 6) {
                errorMsg.textContent = "La contraseña debe tener al menos 6 caracteres.";
                return;
            }

            try {
                if (isRegistering) {
                    const res = await createUserWithEmailAndPassword(auth, email, pass);
                    await setDoc(doc(db, "usuarios", nameInput.value.trim()), {
                        uid: res.user.uid, 
                        email: email, 
                        nombre: nameInput.value.trim(), 
                        fechaRegistro: new Date()
                    });
                } else {
                    await signInWithEmailAndPassword(auth, email, pass);
                }
            } catch (error) {
                // Filtramos el código de error para que no salgan textos técnicos de Firebase
                console.error("Auth Error Code:", error.code);

                if (error.code === 'auth/invalid-credential' || 
                    error.code === 'auth/wrong-password' || 
                    error.code === 'auth/user-not-found') {
                    
                    errorMsg.textContent = "Email o contraseña incorrectos.";
                } 
                else if (error.code === 'auth/email-already-in-use') {
                    errorMsg.textContent = "Este email ya está registrado.";
                }
                else if (error.code === 'auth/weak-password') {
                    errorMsg.textContent = "La contraseña es demasiado débil.";
                }
                else if (error.code === 'auth/invalid-email') {
                    errorMsg.textContent = "El formato del email no es válido.";
                }
                else {
                    errorMsg.textContent = "No se pudo acceder. Revisa los datos.";
                }
            }
        };
    }

    // --- ESCUCHADOR DEL ESTADO DE SESIÓN ---
    onAuthStateChanged(auth, (user) => {
        if (user) onUserLogin(user);
        else onUserLogout();
    });
}