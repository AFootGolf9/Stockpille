package controller

type Rest uint8

const (
	GET Rest = iota
	GETALL
	POST
	PUT
	DELETE
)
