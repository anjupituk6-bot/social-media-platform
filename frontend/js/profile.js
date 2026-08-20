const PROFILE_API = "http://localhost:5001/api";

const profileToken =
    localStorage.getItem("token");

if (!profileToken) {
    window.location.href = "login.html";
}


// LOAD PROFILE
async function loadProfile() {

    try {

        const response = await fetch(
            `${PROFILE_API}/users/profile`,
            {
                headers: {
                    "Authorization":
                        `Bearer ${profileToken}`
                }
            }
        );

        const user = await response.json();

        document.getElementById(
            "profileName"
        ).innerText = user.name;

        document.getElementById(
            "profileEmail"
        ).innerText = user.email;

        document.getElementById(
            "profileBio"
        ).innerText =
            user.bio || "No bio added yet.";

        document.getElementById(
            "followersCount"
        ).innerText =
            user.followers.length;

        document.getElementById(
            "followingCount"
        ).innerText =
            user.following.length;

        document.getElementById(
            "avatar"
        ).innerText =
            user.name.charAt(0).toUpperCase();

        document.getElementById(
            "editName"
        ).value = user.name;

        document.getElementById(
            "editBio"
        ).value = user.bio || "";

    } catch (error) {

        console.error(error);

    }
}


// UPDATE PROFILE
async function updateProfile() {

    const name =
        document.getElementById(
            "editName"
        ).value;

    const bio =
        document.getElementById(
            "editBio"
        ).value;

    const response = await fetch(
        `${PROFILE_API}/users/profile/update`,
        {
            method: "PUT",

            headers: {
                "Content-Type": "application/json",

                "Authorization":
                    `Bearer ${profileToken}`
            },

            body: JSON.stringify({
                name,
                bio
            })
        }
    );

    const data = await response.json();

    alert(data.message);

    if (response.ok) {
        loadProfile();
    }
}


// LOGOUT
function logout() {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "login.html";
}


loadProfile();