package entity

type Item struct {
	Sku         int    `json:"sku"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

func (i *Item) GetId() int {
	return i.Sku
}

func (i *Item) GetName() string {
	return i.Name
}

func (i *Item) GetInfo() string {
	return i.Description
}

func (i *Item) GetValidation() string {
	return ""
}

func (i *Item) SetName(name string) {
	i.Name = name
}

func (i *Item) SetInfo(info string) {
	i.Description = info
}

func (i *Item) SetValidation(validation string) {
}

func (i *Item) GetCamps() []string {
	return []string{"item", "sku", "name", "description"}
}

func (i *Item) GetData() []interface{} {
	return []interface{}{i.Sku, i.Name, i.Description}
}
