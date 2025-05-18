package service

import (
	"stockpille/entity"
	"stockpille/repository"
	"stockpille/repository/entityRepository"
	"stockpille/util"
)

func Start() {
	users, err := entityRepository.SelectAll(&entity.User{})

	if err != nil {
		panic(err)
	}
	for _, user := range users {
		if user.GetId() == 1 {
			return
		}
	}

	user := &entity.User{
		Name:     "ADMIN",
		Password: util.Encript("admin"),
	}
	user.SetId(1)
	// user.Validate()
	err = entityRepository.Insert(user)

	if err != nil {
		panic(err)
	}

	// create the admin user
	role := &entity.Role{
		Name: "ADMIN",
	}
	role.SetId(1)
	role.Validate(1)
	err = entityRepository.Insert(role)

	if err != nil {
		panic(err)
	}

	// update the user with the role

	user.RoleId = role.GetId()
	err = entityRepository.Update(user)

	if err != nil {
		panic(err)
	}

	for _, entities := range entity.Entities {
		repository.CreateRolePermission(1, entities.GetCamps()[0], "RWDU")
	}

	// create the default category
	category := &entity.Category{
		Name: "no category",
	}

	category.SetId(1)
	category.Validate(1)
	err = entityRepository.Insert(category)

	if err != nil {
		panic(err)
	}
}
