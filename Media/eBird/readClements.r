# code to fill JSON bird list library files from eBird/clements checklist
# updated as of v2018
library(tidyverse)
full <- read_csv("rawChecklist.csv") %>%
          select(category, common="English name", 
                 scientific="scientific name",
                 order, family) %>%
          fill(common)

for (r in 1:nrow(full)) {
  if (full$category[r]=="subspecies") {
    subspecies <- strsplit(full$scientific[r], split='\\s+')[[1]] %>% last()
    common <- paste(full$common[r], " (", subspecies, ")", sep="")
    full$common[r] <- common
  }
}

d <- full %>% 
      select(common, scientific, order, family) %>%
      filter(!is.na(family) & !is.na(order))

condenseList <- function(s) {
  s <- gsub(", and ", '/', s)
  s <- gsub(", ", '/', s)
}

of <- full %>% 
        select(order, family) %>%
        distinct() %>%
        mutate(family=condenseList(family))

# these files are stored on git repository
write.csv(d, file="eBird_full.csv", row.names=FALSE)
write.csv(of, file="eBird_orderfamily.csv", row.names=FALSE)

# now right structured JSON lists to file
# these are the files actually referenced by the JS functions

s <- ""
orders <- unique(of$order)
for (o in orders) {
  s <- paste(s, "\"", o, "\":[", sep="")
  families <- unique(filter(of, order==o)$family)
  for (f in families) {
    s <- paste(s, "\"", f, "\"", sep="")
    if (f != last(families)) {
      s <- paste(s, ",", sep="")
    }
  }
  s <- paste(s, "]", sep="")
  if (o != last(orders)) {
    s <- paste(s, ",", sep="")
  }
}
s <- paste("{", s, "}", sep="")

cat(s, file="order_families.json")

s <- ""
for (r in 1:nrow(d)) {
  common <- d$common[r]
  family <- d$family[r]
  s <- paste(s, "\"", common, "\":\"",
             family, "\"", sep="")
  if (r != nrow(d)) {
    s <- paste(s, ",", sep="")
  }
}

s <- paste("{", s, "}", sep="")
cat(s, file="species_families.json")