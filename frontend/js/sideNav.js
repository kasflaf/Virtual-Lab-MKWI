/* Set the width of the side navigation to 250px and the left margin of the page content to 250px and add a black background color to body */
function openNav() {
    document.getElementById("Sidenav").style.width = "250px";
    const overlay = document.getElementById("overlay");
    overlay.style.opacity = "1"; // Set opacity to 1 for fade-in
    overlay.style.visibility = "visible"; // Make it visible
}
  
/* Set the width of the side navigation to 0 and the left margin of the page content to 0, and the background color of body to white */
function closeNav() {
    document.getElementById("Sidenav").style.width = "0";
    const overlay = document.getElementById("overlay");
    overlay.style.opacity = "0"; // Set opacity to 0 for fade-out
    overlay.style.visibility = "hidden"; // Hide it
} 