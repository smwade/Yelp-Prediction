from django.shortcuts import render

def index(request):
  print request
  print render(request, 'index.html', None)
  return render(request, 'index.html', None)
