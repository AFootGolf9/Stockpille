package entity

import "stockpille/util"

type User struct {
	Id       int    `json:"id"`
	Name     string `json:"name"`
	Role     string `json:"role"`
	Password string `json:"password"`
}

func (u *User) GetId() int {
	return u.Id
}

func (u *User) SetId(id int) {
	u.Id = id
}

func (u *User) GetCamps() []string {
	return []string{"user_data", "id", "name", "role", "password"}
}

func (u *User) GetPath() string {
	return "user"
}

func (u *User) GetData() []any {
	return []any{&u.Id, &u.Name, &u.Role, &u.Password}
}

func (u *User) Validate() {
	if u.Name == "" {
		panic("Name is required")
	}
	if u.Role == "" {
		panic("Role is required")
	}
	if u.Password == "" {
		panic("Password is required")
	}

	u.Password = util.Encript(u.Password)
}

func (u *User) ValidateUpdate() {
	if u.Password != "" {
		u.Password = util.Encript(u.Password)
	}
}

func (u *User) New() Entity {
	return &User{}
}
