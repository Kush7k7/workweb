 changePage = function(page) {
    console.log("clicked page:", page); // DEBUG
    const params = new URLSearchParams(window.location.search);
    params.set("page", page);
    window.location.href = "/homeWorker?" + params.toString();
}

function applyFilters() {
    const category = document.getElementById("category").value;
    const location = document.getElementById("location").value;
    const minBudget = document.getElementById("minBudget").value;
    const maxBudget = document.getElementById("maxBudget").value;

    const params = new URLSearchParams();

    if (category) params.set("category", category);
    if (location) params.set("location", location);
    if (minBudget) params.set("minBudget", minBudget);
    if (maxBudget) params.set("maxBudget", maxBudget);

    window.location.href = "/homeWorker?" + params.toString();
}
document.addEventListener("DOMContentLoaded", function () {

    const offerButtons = document.querySelectorAll(".offer-btn");
    const claimButtons = document.querySelectorAll(".Claim-btn");
    const sendOfferButtons = document.querySelectorAll(".send-offer-btn");

    offerButtons.forEach(button => {
        button.addEventListener("click", function () {

            const card = this.closest(".job-card");

            // Close all cards first
            document.querySelectorAll(".job-card").forEach(c => {
                if (c !== card) {
                    c.classList.remove("active");
                }
            });

            // Toggle current one
            card.classList.toggle("active");
        });
    });


   sendOfferButtons.forEach(button => {
        button.addEventListener("click", async function () {

            const card = this.closest(".job-card");
            const jobId = this.dataset.id;
            const price = card.querySelector(".offer-price").value;

            if (!price) {
                alert("Enter price");
                return;
            }

            try {
                const res = await fetch("/send-offer", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({ jobId, offerPrice: price })
                });

                const data = await res.json();

                if (data.success) {
                    const offerBtn = card.querySelector(".offer-btn");
                    const claimBtn = card.querySelector(".Claim-btn");

                    // ✅ UI Update
                    offerBtn.innerHTML = "✔ Sent";
                    offerBtn.classList.add("sent");
                    offerBtn.disabled = true;

                    claimBtn.innerHTML = "✔ Claimed";
                    claimBtn.classList.add("claimed");
                    claimBtn.disabled = true;

                    card.classList.remove("active");
                    card.querySelector(".offer-price").value = "";

                } else {
                    alert("Failed to send offer");
                }

            } catch (err) {
                console.log(err);
                alert("Error sending offer");
            }

        });



     claimButtons.forEach(button => {
        button.addEventListener("click", async function () {
                
 const jobId = this.dataset.id;

            const res = await fetch("/claim-job", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },credentials: "include",
                body: JSON.stringify({ jobId })
            });

            const data = await res.json();

            if (data.success) {
                this.innerHTML = "✔ Claimed";
                this.classList.add("claimed");
                this.disabled = true;
            } else {
                alert(data.message || "Already claimed");
            }
        });
       
    });

});
});
