package service

import (
	"stockpille/entity"
	"stockpille/repository"
)

func NewLocation(location entity.Location) {
	repository.InsertLocation(location)
}

func GetAllLocations() []entity.Location {
	return repository.GetAllLocations()
}
