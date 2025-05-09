package entity

import (
	"stockpille/repository"
	"stockpille/util"
	"strings"
)

type User struct {
	Id       int    `json:"id"`
	RoleId   int    `json:"roleId"`
	Name     string `json:"name"`
	Password string `json:"password"`
}

func (u *User) GetId() int {
	return u.Id
}

func (u *User) SetId(id int) {
	u.Id = id
}

func (u *User) GetCamps() []string {
	return []string{"user_data", "id", "name", "roleid", "password"}
}

func (u *User) GetPath() string {
	return "user"
}

func (u *User) GetData() []any {
	return []any{&u.Id, &u.Name, &u.RoleId, &u.Password}
}

func (u *User) IsPersisted() bool {
	return true
}

func (u *User) Validate() {
	if u.Name == "" {
		panic("Name is required")
	}
	if u.RoleId == -1 || u.RoleId == 0 {
		panic("Role is required")
	}
	if u.Password == "" {
		panic("Password is required")
	}

	roleId := repository.VerifyRole(u.RoleId)

	if !roleId {
		panic("Role not found")
	}

	u.Password = util.Encript(u.Password)
	u.Name = strings.ToUpper(u.Name)

}

func (u *User) ValidateUpdate() {
	camps := []string{"user_data", "id"}
	data := []any{&u.Id}
	if u.Password != "" {
		u.Password = util.Encript(u.Password)
	} else {
		println("password added")
		camps = append(camps, "password")
		data = append(data, &u.Password)
	}
	if u.Name != "" {
		u.Name = strings.ToUpper(u.Name)
	} else {
		camps = append(camps, "name")
		data = append(data, &u.Name)
	}
	err := repository.PrepareForUpdate(camps, data)

	if err != nil {
		panic(err)
	}
}

func (u *User) HideSecret() {
	u.Password = ""
}

func (u *User) New() Entity {
	return &User{}
}
