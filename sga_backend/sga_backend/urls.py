from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from atendimentos.views import dashboard

urlpatterns = [
    path('admin/dashboard/', dashboard, name='admin_dashboard'),
    path('admin/', admin.site.urls),
    path('api/', include('atendimentos.urls')),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
