import { Theme } from '@mui/material/styles';

export const communitiesStyles = (theme: Theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(3)
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(4)
  },
  cardGrid: {
    marginTop: theme.spacing(4)
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: theme.shadows[4]
    }
  },
  cardContent: {
    flexGrow: 1
  },
  cardActions: {
    justifyContent: 'space-between',
    padding: theme.spacing(2)
  },
  createButton: {
    marginLeft: 'auto'
  },
  dialog: {
    '& .MuiDialog-paper': {
      padding: theme.spacing(2)
    }
  },
  dialogContent: {
    marginTop: theme.spacing(2)
  },
  errorMessage: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.dark
  },
  loadingSpinner: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '200px'
  }
});