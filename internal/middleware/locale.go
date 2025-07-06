package middleware

import (
	"github.com/nicksnyder/go-i18n/v2/i18n"

	"github.com/gin-gonic/gin"
	"golang.org/x/text/language"
)

func LocaleMiddleware(b *i18n.Bundle) gin.HandlerFunc {
	return func(c *gin.Context) {
		lang := c.GetHeader("Accept-Language")
		matcher := language.NewMatcher(b.LanguageTags())
		tag, _ := language.MatchStrings(matcher, lang)
		c.Set("locale", tag.String())
		c.Next()
	}
}
