package service

import (
	"stockpille/entity"
	"stockpille/repository"
)

func NewItem(item entity.Item) {
	repository.InsertItem(item)
}

func GetAllItems() []entity.Item {
	return repository.GetAllItems()
}
