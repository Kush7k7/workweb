let skip = document.querySelectorAll(".post-card").length;
let loading = false;

async function loadMorePosts() {

    if (loading) return;
    loading = true;

    try {

        const res = await fetch(`/load-more-posts?skip=${skip}`);
        const posts = await res.json();

        const container = document.getElementById("posts-container");

        if(posts.length === 0){
            observer.disconnect();
            return;
        }

        posts.forEach(post => {

            const div = document.createElement("div");
            div.className = "post-card";

            div.innerHTML = `
<div class="post-header">
    <img src="${post.avatar}" class="avatar">
    <div class="author-info">
        <h4>${post.author}</h4>
        <span class="meta">${post.accountType}</span>
    </div>
</div>

<div class="post-body">
    <p>${post.text}</p>
    <p class="hashtags">${post.hashtags}</p>
</div>

<div class="post-media">
    <img src="${post.imageUrl}">

    ${post.isVideo ? `
        <div class="play-button">
            <i class="fa-solid fa-play"></i>
        </div>
    ` : ""}
</div>

<div class="post-footer">
    <div class="action">
        <i class="fa-solid fa-heart" style="color:#e74c3c;"></i> ${post.likes}k
    </div>

    <div class="action">
        <i class="fa-solid fa-comment"></i> ${post.comments}
    </div>

    <div class="action">
        <i class="fa-solid fa-share"></i>
    </div>

    <div class="action">
        <i class="fa-solid fa-ellipsis"></i>
    </div>
</div>
`;

            container.appendChild(div);

        });

        skip += posts.length;

    } catch(err){
        console.log(err);
    }

    loading = false;
}

const observer = new IntersectionObserver(entries => {

    if(entries[0].isIntersecting){
        loadMorePosts();
    }

});

observer.observe(document.querySelector("#scroll-trigger"));

// function toggle() {
//   const p = document.getElementById("password");
//   p.type = p.type === "password" ? "text" : "password";
// }