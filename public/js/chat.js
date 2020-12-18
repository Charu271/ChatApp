const socket = io();
// socket.on("countUpdated", (count) => {
//   console.log("Count has been updated to " + count);
// });
// document.querySelector("#increment").addEventListener("click", () => {
//   socket.emit("increment");
// });

const $messageForm = document.querySelector("#Form");
const $messageFormInput = document.querySelectorAll("input")[0];
const $messageFormButton = document.querySelectorAll("button")[0];
const $sendLocation = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");
const $sidebar = document.querySelector("#sidebar");

const $messageTemplate = document.querySelector("#message-template").innerHTML;
const $urlTemplate = document.querySelector("#url-template").innerHTML;
const $sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

console.log($messageFormButton);

const autoscroll = () => {
  // new message
  const $newMessage = $messages.lastElementChild;

  //height of new message
  const $newMessageStyles = getComputedStyle($newMessage);
  const $newMessageMargin = parseInt($newMessageStyles.marginBottom);
  const $newMessageHeight = $newMessage.offsetHeight + $newMessageMargin;

  //visible Height
  const $visibleHeight = $messages.offsetHeight;

  //container height
  const $containerHeight = $messages.scrollHeight;

  //How much i scrolled
  const $scrollOffset = $messages.scrollTop + $visibleHeight;

  if ($containerHeight - $newMessageHeight <= $scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on("message", (message) => {
  const html = Mustache.render($messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
  console.log(message);
});

socket.on("locationMessage", (message) => {
  const html = Mustache.render($urlTemplate, {
    username: message.username,
    url: message.url,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
  console.log(url);
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render($sidebarTemplate, {
    room,
    users,
  });
  $sidebar.insertAdjacentHTML("beforeend", html);
});
$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  $messageFormButton.setAttribute("disabled", "disabled");
  const clientMessage = e.target.elements.message.value;
  socket.emit("sendMessage", clientMessage, (error) => {
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();
    if (error) {
      return console.log(error);
    }
    console.log("The message has been delievered");
  });
});

$sendLocation.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Your browser doesn't suport geolocation");
  }
  $sendLocation.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "sendLocation",
      {
        lat: position.coords.latitude,
        long: position.coords.longitude,
      },
      () => {
        $sendLocation.removeAttribute("disabled");
        console.log("Location shared!");
      }
    );
  });
});
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
