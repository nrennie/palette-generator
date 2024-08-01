library(shiny)
library(htmltools)
library(ggplot2)
library(shinythemes)


# Functions ---------------------------------------------------------------

# From https://github.com/nrennie/usefunc/blob/main/R/random_hex.R
random_hex <- function(n) {
  generate_hex <- function() {
    choices <- sample(c(as.character(0:9), LETTERS[1:6]),
      size = 6, replace = TRUE
    )
    output <- paste0("#", paste0(choices, collapse = ""))
    return(output)
  }
  hex <- replicate(n = n, generate_hex(), simplify = TRUE)
  return(hex)
}

plot_hex <- function(hex) {
  plot_df <- data.frame(
    hex = hex,
    y = rev(seq_along(hex)))
  g <- ggplot(
    data = plot_df,
    mapping = aes(
      x = "1",
      y = y,
      fill = hex,
      label = hex
    )
  ) +
    geom_raster() +
    geom_label(fill = "white") +
    scale_fill_identity() +
    coord_cartesian(expand = FALSE) +
    theme_void()
  return(g)
}

# Define UI for app that draws a histogram ----
ui <- fluidPage(
  theme = shinytheme("darkly"),
  titlePanel("Palette Generator"),
  sidebarLayout(
    sidebarPanel(
      hr(),
      # Select number of colours
      selectInput(
        inputId = "n_colours",
        label = "Number of colors:",
        choices = 1:12,
        selected = 6
      ),
      # Regenerate palette
      actionButton(
        inputId = "generate",
        label = "Regenerate palette"
      ),
      width = 6
    ),
    mainPanel(
      plotOutput("plot_palette"),
      br(),
      markdown("Use this palette in R:"),
      verbatimTextOutput("r_palette"),
      markdown("Use this palette in Python:"),
      verbatimTextOutput("py_palette"),
      br(),
      width = 6
    )
  )
)

server <- function(input, output) {
  
  # Generate palette
  palette <- eventReactive(
    c(input$n_colours, input$generate),
    {
      random_hex(n = input$n_colours)
    }
  )
  
  # Plot palette
  output$plot_palette <- renderPlot({
    plot_hex(palette())
  })
  
  # Vector of palettes in R
  output$r_palette <- renderPrint({
    cat(paste0(
      "c(",
      paste0(
        paste0("'", palette(), "'"),
        collapse = ", "
      ), ")"
    ))
  })
  
  # Vector of palettes in Python
  output$py_palette <- renderPrint({
    cat(paste0(
      "[",
      paste0(
        paste0("'", palette(), "'"),
        collapse = ", "
      ), "]"
    ))
  })
  
}

shinyApp(ui = ui, server = server)
