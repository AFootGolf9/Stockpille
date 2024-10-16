package repository

import (
	"stockpille/entity"
)

func InsertUser(user entity.User) {
	_, err := db.Exec(("INSERT INTO user_data (name, role, password) VALUES ($1, $2, $3)"),
		user.Name, user.Role, user.Password)
	if err != nil {
		panic(err)
	}
}

func GetUserById(id int) *entity.User {
	row := db.QueryRow("SELECT * FROM user_data WHERE id = $1", id)

	var userDB entity.User
	err := row.Scan(&userDB.Id, &userDB.Name, &userDB.Role, &userDB.Password)
	if err != nil {
		if err.Error() == "sql: no rows in result set" {
			return nil
		}
		panic(err)
	}
	return &userDB
}

func GetUserByName(user string) *entity.User {
	row := db.QueryRow("SELECT * FROM user_data WHERE name = $1", user)

	var userDB entity.User
	err := row.Scan(&userDB.Id, &userDB.Name, &userDB.Role, &userDB.Password)
	if err != nil {
		if err.Error() == "sql: no rows in result set" {
			return nil
		}
		panic(err)
	}
	return &userDB
}

func GetUsers() []entity.User {
	rows, err := db.Query("SELECT id, name, role FROM user_data")
	if err != nil {
		panic(err)
	}
	defer rows.Close()

	var users []entity.User
	for rows.Next() {
		var user entity.User
		err := rows.Scan(&user.Id, &user.Name, &user.Role)
		if err != nil {
			panic(err)
		}
		users = append(users, user)
	}
	return users
}

func DeleteUser(id int) {
	deleteTokenFromUser(id)
	_, err := db.Exec("DELETE FROM user_data WHERE id = $1", id)
	if err != nil {
		panic(err)
	}
}

func UpdateUser(user entity.User) {
	_, err := db.Exec("UPDATE user_data SET name = $1, role = $2, password = $3 WHERE id = $4",
		user.Name, user.Role, user.Password, user.Id)
	if err != nil {
		panic(err)
	}
}
