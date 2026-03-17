

window.changePage = function(page) {
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