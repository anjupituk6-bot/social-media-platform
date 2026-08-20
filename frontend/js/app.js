const API_URL = "http://localhost:5001/api";

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}

// LOAD POSTS
async function loadPosts() {

    try {

        const response = await fetch(
            `${API_URL}/posts`
        );

        const posts = await response.json();

        const container =
            document.getElementById("posts");

        container.innerHTML = "";

        posts.forEach(post => {

            const likedByMe =
                post.likes.some(
                    user => user._id === getCurrentUserId()
                );

            const postElement =
                document.createElement("div");

            postElement.className = "post";

            postElement.innerHTML = `

                <div class="post-header">

                    <div class="avatar">
                        ${post.author.name
                            .charAt(0)
                            .toUpperCase()}
                    </div>

                    <div>
                        <strong>
                            ${escapeHTML(post.author.name)}
                        </strong>

                        <small>
                            ${new Date(
                                post.createdAt
                            ).toLocaleString()}
                        </small>
                    </div>

                </div>

                <div class="post-content">
                    ${escapeHTML(post.content)}
                </div>

                <div class="post-actions">

                    <button onclick="likePost('${post._id}')">
                        ${likedByMe ? "💔 Unlike" : "❤️ Like"}
                        (${post.likes.length})
                    </button>

                    <button onclick="showComments('${post._id}')">
                        💬 Comments
                    </button>

                </div>

                <div id="comments-${post._id}"></div>

                <div class="comment-box">

                    <input
                        id="comment-${post._id}"
                        placeholder="Write a comment..."
                    >

                    <button onclick="addComment('${post._id}')">
                        Comment
                    </button>

                </div>
            `;

            container.appendChild(postElement);

        });

    } catch (error) {

        console.error(error);

    }
}


// CREATE POST
async function createPost() {

    const content =
        document.getElementById("postContent").value;

    if (!content.trim()) {
        alert("Write something first");
        return;
    }

    const response = await fetch(
        `${API_URL}/posts`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },

            body: JSON.stringify({
                content
            })
        }
    );

    if (response.ok) {

        document.getElementById("postContent").value = "";

        loadPosts();

    } else {

        alert("Failed to create post");

    }
}


// LIKE POST
async function likePost(postId) {

    await fetch(
        `${API_URL}/posts/${postId}/like`,
        {
            method: "PUT",

            headers: {
                "Authorization": `Bearer ${token}`
            }
        }
    );

    loadPosts();
}


// ADD COMMENT
async function addComment(postId) {

    const input =
        document.getElementById(
            `comment-${postId}`
        );

    const content = input.value;

    if (!content.trim()) return;

    const response = await fetch(
        `${API_URL}/posts/${postId}/comments`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },

            body: JSON.stringify({
                content
            })
        }
    );

    if (response.ok) {

        input.value = "";

        showComments(postId);

    }
}


// SHOW COMMENTS
async function showComments(postId) {

    const response = await fetch(
        `${API_URL}/posts/${postId}/comments`
    );

    const comments = await response.json();

    const container =
        document.getElementById(
            `comments-${postId}`
        );

    container.innerHTML = "";

    comments.forEach(comment => {

        const div =
            document.createElement("div");

        div.className = "comment";

        div.innerHTML = `
            <strong>
                ${escapeHTML(comment.author.name)}
            </strong>

            ${escapeHTML(comment.content)}
        `;

        container.appendChild(div);

    });
}


// LOAD USERS
async function loadUsers() {

    const response = await fetch(
        `${API_URL}/users`
    );

    const users = await response.json();

    const container =
        document.getElementById("users");

    container.innerHTML = "";

    const currentId = getCurrentUserId();

    users.forEach(user => {

        if (user._id === currentId) return;

        const isFollowing =
            user.followers.some(
                id => id === currentId
            );

        const div =
            document.createElement("div");

        div.className = "user-card";

        div.innerHTML = `

            <div>

                <strong>
                    ${escapeHTML(user.name)}
                </strong>

                <p>
                    Followers:
                    ${user.followers.length}
                </p>

            </div>

            <button
                onclick="followUser('${user._id}')"
            >
                ${isFollowing
                    ? "Unfollow"
                    : "Follow"}
            </button>
        `;

        container.appendChild(div);

    });
}


// FOLLOW / UNFOLLOW
async function followUser(userId) {

    const response = await fetch(
        `${API_URL}/users/${userId}/follow`,
        {
            method: "PUT",

            headers: {
                "Authorization": `Bearer ${token}`
            }
        }
    );

    if (response.ok) {

        loadUsers();

    }

}


// CURRENT USER
function getCurrentUserId() {

    const user =
        JSON.parse(
            localStorage.getItem("user")
        );

    return user ? user.id : null;
}


// LOGOUT
function logout() {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "login.html";
}


// BASIC HTML ESCAPE
function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


loadPosts();
loadUsers();