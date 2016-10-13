args = commandArgs(trailingOnly = TRUE)
data <- read.csv(args[1])
fit <- cmdscale(dist(data), k=2, list. = TRUE)
x <- fit$points[, 1]
y <- fit$points[, 2]
write.csv(fit$points, args[2])