const nameElm = document.querySelector("#txt-name");
const contactElm = document.querySelector("#txt-contact");
const btnElm = document.querySelector("#btn-add");
const tblElm = document.querySelector("#tbl");
let editId = 0;
const { API_BASE_URL } = process.env;

btnElm.addEventListener("click", () => {
    const name = nameElm.value.trim();
    const contact = contactElm.value.trim();

    if (!/^[A-Za-z ]+$/.test(name)) {
      nameElm.focus();
      nameElm.select();
      return;
    } else if (!/^\d{3}-\d{7}$/.test(contact)) {
      contactElm.focus();
      contactElm.select();
      return;
    }
  if (btnElm.textContent === "ADD") {
    fetch(`${API_BASE_URL}/teachers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, contact }),
    })
      .then((res) => {
        if (res.status === 201) {
          res.json().then((teacher) => {
            createNewRow(teacher);
            (nameElm.value = ""), (contactElm.value = ""), nameElm.focus();
          });
        } else {
          alert("Failed to creat a Teacher!");
        }
      })
      .catch((err) => {
        alert("Something went wrong, try again later");
      });
  } else if (btnElm.textContent === "UPDATE") {
    updateTeacher();
    nameElm.value = "";
    contactElm.value = "";
    btnElm.textContent = "ADD";
  }
});

function createNewRow(teacher) {
  const trElm = document.createElement("tr");
  document.querySelector("#tbl tbody").append(trElm);
  trElm.id = "teacher-" + teacher.id;

  trElm.innerHTML = `
        <tr>
            <td>${teacher.id}</td>
            <td>${teacher.name}</td>
            <td>${teacher.contact}</td>
            <td>
            <button class="edit btn btn-success">Edit</button>
            <button class="delete btn btn-danger">Delete</button>
            </td>
        </tr>
    `;
}

loadAllTeachers();

function loadAllTeachers() {
  clearTable();
  fetch(`${API_BASE_URL}/teachers`)
    .then((res) => {
      if (res.ok) {
        res
          .json()
          .then((teacherList) =>
            teacherList.forEach((teacher) => createNewRow(teacher))
          );
      } else {
        alert("Falied to load teacher list");
      }
    })
    .catch((err) => alert("Something went wrong"));
}

tblElm.addEventListener("click", (e) => {
  if (e.target?.classList.contains("delete")) {
    const teacherId = e.target.closest("tr").id.substring(8);
    fetch(`${API_BASE_URL}/teachers/${teacherId}`, { method: "DELETE" })
      .then((res) => {
        if (res.ok) {
          e.target.closest("tr").remove();
        } else {
          alert("Falied to delete Teacher");
        }
      })
      .catch((err) => {
        alert("Something went wrong, try again");
      });
  } else if (e.target?.classList.contains("edit")) {
    const teacherId = e.target.closest("tr").id.substring(8);
    fetch(`${API_BASE_URL}/teachers/${teacherId}`)
      .then((res) => {
        if (res.ok) {
          res.json().then((teacher) => {
            nameElm.value = teacher.name;
            contactElm.value = teacher.contact;
            editId = teacher.id;
          });
          btnElm.textContent = "UPDATE";
        } else {
          throw new Error("Failed to fetch teacher data for editing");
        }
      })
      .catch((err) => {
        alert("Something went wrong while fetching the teacher data");
      })
      .finally(() => {});
  }
});

function updateTeacher() {
  const name = nameElm.value.trim();
  const contact = contactElm.value.trim();
  fetch(`${API_BASE_URL}/teachers/${editId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, contact }),
  })
    .then((res) => {
      if (res.ok) {
        loadAllTeachers();
      } else {
        throw new Error("Falied edit teacher data");
      }
    })
    .catch((err) => {
      alert("Something went wrong fetching the teacher data, try again");
    });
}

function clearTable() {
  const tbodyElm = document.querySelector("#tbl tbody");
  while (tbodyElm.firstChild) {
    tbodyElm.removeChild(tbodyElm.firstChild);
  }
}
