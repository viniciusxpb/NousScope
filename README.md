# NousScope

**NousScope** is an interactive neural network visualization and playground tool built with **Angular**. It allows users to design, visualize, and analyze neural network architectures in real-time.

![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)

## Live Demo
[**Click here to view the live application**](https://viniciusxpb.github.io/NousScope/)

## Features

- **Architecture Builder**:
  - Create and manage multiple neural networks simultaneously.
  - Add/remove hidden layers and customize neuron counts.
  - Select activation functions (Sigmoid, ReLU, Tanh, etc.) per layer or globally.
  - Collapsible network cards for easy management.

- **Interactive Canvas**:
  - Real-time visualization of network structures (nodes and connections).
  - Visual representation of weights and biases.
  - **Network Output Plotting**: See the function your network is approximating in real-time.
  - Zoom and Pan capabilities for detailed inspection.

- **Formula Plotter & Comparison**:
  - Plot mathematical formulas to visualize target functions.
  - Compare network outputs against known functions (e.g., `sin(x)`, `x^2`).
  - Syntax highlighting and error checking for formulas.

- **Presets & Controls**:
  - Save and load network configurations.
  - Randomize weights to explore different initialization states.
  - Visual animation of the forward pass cycle.

## Getting Started

### Prerequisites

- **Node.js** (v18+ recommended)
- **npm** or **yarn**
- **Angular CLI** (`npm install -g @angular/cli`)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/viniciusxpb/NousScope.git
   cd NousScope
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   ng serve
   ```
   Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Build & Deploy

To build the project for production:

```bash
ng build
```

The build artifacts will be stored in the `dist/` directory.

### GitHub Pages Deployment

This project is configured for automatic deployment to GitHub Pages using `angular-cli-ghpages`.

```bash
ng deploy --base-href=/NousScope/
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
