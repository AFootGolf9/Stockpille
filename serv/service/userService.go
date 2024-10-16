package service

import (
	"stockpille/entity"
	"stockpille/repository"
	"stockpille/util"
)

func validateUser(user string, pass string) bool {
	userDB := repository.GetUserByName(user)

	if userDB == nil {
		return false
	}
	return util.ComparePass(userDB.Password, pass)
}

func NewUser(user entity.User) bool {
	if repository.GetUserByName(user.Name) != nil {
		return false
	}
	user.Password = util.Encript(user.Password)
	repository.InsertUser(user)

	return true
}

func Login(user entity.User) string {
	if validateUser(user.Name, user.Password) {
		token := util.RandomToken()
		repository.NewToken(token, repository.GetUserByName(user.Name).Id)
		return token
	} else {
		return "error"
	}
}

func GetAllUsers() []entity.User {
	return repository.GetUsers()
}

func GetUserById(id int) *entity.User {
	return repository.GetUserById(id)
}

func DeleteUser(id int) {
	repository.DeleteUser(id)
}

func UpdateUser(user entity.User) {

	dbUser := repository.GetUserById(user.Id)
	if dbUser == nil {
		return
	}

	if user.Name != "" {
		dbUser.Name = user.Name
	}
	if user.Role != "" {
		dbUser.Role = user.Role
	}
	if user.Password != "" {
		dbUser.Password = util.Encript(user.Password)
	}

	repository.UpdateUser(*dbUser)
}
