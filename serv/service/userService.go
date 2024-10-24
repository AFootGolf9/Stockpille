package service

import (
	"stockpille/entity"
	"stockpille/repository"
	"stockpille/repository/entityRepository"
	"stockpille/util"
)

func validateUser(user string, pass string) bool {
	userDB, err := entityRepository.Query(&entity.User{}, 2, user)

	if err != nil {
		return false
	}

	if userDB == nil {
		return false
	}

	camps := userDB[0].GetCamps()
	data := userDB[0].GetData()

	for i := 0; i < len(camps); i++ {
		if camps[i] == "password" {
			passDB := data[i-1].(*string)
			return util.ComparePass(*passDB, pass)
		}
	}

	return false
}

func Login(user entity.User) string {
	if validateUser(user.Name, user.Password) {
		token := util.RandomToken()
		queryResult, err := entityRepository.Query(&user, 2, user.Name)

		if err != nil {
			print(err)
			return "error"
		}

		repository.NewToken(token, queryResult[0].GetId())
		return token
	} else {
		return "error"
	}
}
