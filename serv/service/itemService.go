package service

import "stockpille/repository"

func CountItens(itemId int) (int64, error) {
	// Call the repository to get the count of items
	count, err := repository.CountItens(itemId)
	if err != nil {
		return 0, err
	}
	return count, nil
}
