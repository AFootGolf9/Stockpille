package service

import (
	"stockpille/entity"
	"stockpille/repository"
	"stockpille/repository/entityRepository"
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
	// create the admin user
	role := &entity.Role{
		Name: "admin",
	}
	role.SetId(1)
	role.Validate()
	err = entityRepository.Insert(role)

	if err != nil {
		panic(err)
	}

	user := &entity.User{
		Name:     "admin",
		Password: "admin",
		RoleId:   1,
	}
	user.SetId(1)
	user.Validate()
	err = entityRepository.Insert(user)

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
	category.Validate()
	err = entityRepository.Insert(category)

	if err != nil {
		panic(err)
	}
}
