package main

import "os"

func RetrieveEnv(key string, d string) string {
	v, e := os.LookupEnv(key)
	if e {
		return v
	}
	return d
}
